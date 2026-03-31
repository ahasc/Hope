import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import { createInitialState, processAction } from './server/gameActions';
import type { GameState } from './store/types';

const port = parseInt(process.env.PORT ?? '3000', 10);
const dev  = process.env.NODE_ENV !== 'production';

const nextApp = next({ dev, port });
const handle  = nextApp.getRequestHandler();

// ── Room state ───────────────────────────────────────────

interface RoomMember {
  socketId:   string;
  playerId:   string | null;
  playerName: string;
  isHost:     boolean;
}

interface Room {
  code:                string;
  members:             RoomMember[];
  gameState:           GameState;
  confirmedThresholds: Set<string>;
}

const rooms       = new Map<string, Room>();
const socketToRoom = new Map<string, string>();

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Boot ─────────────────────────────────────────────────

nextApp.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  function broadcastState(roomCode: string) {
    const room = rooms.get(roomCode);
    if (!room) return;
    io.to(roomCode).emit('state_update', { state: room.gameState });
  }

  function broadcastMembers(roomCode: string) {
    const room = rooms.get(roomCode);
    if (!room) return;
    const members = room.members
      .filter((m) => m.socketId && m.playerName)
      .map((m) => ({ name: m.playerName, isHost: m.isHost }));
    io.to(roomCode).emit('room_members', { members });
  }

  // ── Bot driver ──────────────────────────────────────────

  function scheduleBotAction(roomCode: string) {
    const room = rooms.get(roomCode);
    if (!room) return;
    const holder = room.gameState.players.find((p) => p.isHopeHolder && p.isAlive);
    if (!holder?.isBot) return;

    if (room.gameState.phase === 'legs') {
      setTimeout(() => {
        const r = rooms.get(roomCode);
        if (!r || r.gameState.phase !== 'legs') return;
        const alive = r.gameState.players.filter((p) => p.isAlive && !p.isHopeHolder);
        if (alive.length === 0) {
          r.gameState = processAction(r.gameState, 'keepHope', {});
        } else {
          const target = [...alive].sort(
            (a, b) => (a.curseTokens / a.threshold) - (b.curseTokens / b.threshold)
          )[0];
          r.gameState = processAction(r.gameState, 'passHope', { toPlayerId: target.id });
          r.gameState = processAction(r.gameState, 'advanceTurn', {});
        }
        broadcastState(roomCode);
        scheduleBotAction(roomCode);
      }, 2000);
      return;
    }

    if (room.gameState.phase === 'evenement' && room.gameState.pendingEvent) {
      setTimeout(() => {
        const r = rooms.get(roomCode);
        if (!r || r.gameState.phase !== 'evenement') return;
        const alive = r.gameState.players.filter((p) => p.isAlive && !p.isHopeHolder);
        const needsTarget = ['DON_FORCE', 'OBLIGATION_ACHAT', 'GLOIRE_REDISTRIBUEE'].includes(
          r.gameState.pendingEvent?.mechanicKey ?? ''
        );
        const targetId = needsTarget && alive.length > 0
          ? alive[Math.floor(Math.random() * alive.length)].id
          : undefined;
        r.gameState = processAction(r.gameState, 'resolveEvent', { targetId });
        if (r.gameState.finalEventTriggered && r.gameState.phase !== 'end') {
          r.gameState = processAction(r.gameState, 'endGame', {});
        }
        broadcastState(roomCode);
        scheduleBotAction(roomCode);
      }, 2000);
      return;
    }
  }

  // ── Socket events ───────────────────────────────────────

  io.on('connection', (socket) => {
    console.log('[connect]', socket.id);

    socket.on('create_room', ({ hostName }: { hostName: string }) => {
      const code = generateCode();
      const room: Room = {
        code,
        members: [{ socketId: socket.id, playerId: null, playerName: hostName, isHost: true }],
        gameState: createInitialState(),
        confirmedThresholds: new Set(),
      };
      rooms.set(code, room);
      socketToRoom.set(socket.id, code);
      socket.join(code);
      socket.emit('room_created', { roomCode: code, playerId: null, isHost: true, state: room.gameState });
      broadcastMembers(code);
      console.log('[room_created]', code, 'by', hostName);
    });

    socket.on('join_room', ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      const code = roomCode.toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) {
        socket.emit('room_error', { message: 'Salle introuvable. Vérifiez le code.' });
        return;
      }

      const matchedPlayer = room.gameState.players.find(
        (p) => p.name.toLowerCase() === playerName.toLowerCase()
      );

      const existing = room.members.find((m) => m.socketId === socket.id);
      if (!existing) {
        room.members.push({ socketId: socket.id, playerId: matchedPlayer?.id ?? null, playerName, isHost: false });
      } else {
        existing.playerId = matchedPlayer?.id ?? null;
      }

      socketToRoom.set(socket.id, code);
      socket.join(code);
      socket.emit('room_joined', {
        roomCode: code,
        playerId: matchedPlayer?.id ?? null,
        isHost: false,
        state: room.gameState,
      });
      broadcastMembers(code);
      console.log('[room_joined]', code, playerName, '->', matchedPlayer?.id ?? 'observer');
    });

    socket.on('game_action', ({ roomCode, action, payload }: { roomCode: string; action: string; payload: Record<string, unknown> }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      if (action === 'confirmThreshold') {
        room.gameState = processAction(room.gameState, 'setThreshold', {
          playerId: payload.playerId,
          value: payload.value,
        });
        room.confirmedThresholds.add(payload.playerId as string);
        const nonHeritier = room.gameState.players.filter((p) => p.character !== 'heritier');
        if (room.confirmedThresholds.size >= nonHeritier.length) {
          room.gameState = { ...room.gameState, phase: 'accumulation' };
        }
      } else {
        room.gameState = processAction(room.gameState, action, payload ?? {});
        if (action === 'initGame') {
          room.confirmedThresholds = new Set();
          room.gameState.players
            .filter((p) => p.character === 'heritier')
            .forEach((p) => room.confirmedThresholds.add(p.id));
          room.members = room.members.map((m) => {
            const matched = room.gameState.players.find(
              (p) => p.name.toLowerCase() === m.playerName.toLowerCase()
            );
            return { ...m, playerId: matched?.id ?? null };
          });
          room.members.forEach((m) => {
            io.to(m.socketId).emit('player_assigned', { playerId: m.playerId });
          });
          // Auto-confirm bot thresholds
          room.gameState.players
            .filter((p) => p.isBot)
            .forEach((p) => room.confirmedThresholds.add(p.id));
          // Check if all non-heritier thresholds are already confirmed
          const nonHeritierTotal = room.gameState.players.filter((p) => p.character !== 'heritier');
          if (room.confirmedThresholds.size >= nonHeritierTotal.length) {
            room.gameState = { ...room.gameState, phase: 'accumulation' };
          }
        }
      }

      broadcastState(roomCode);
      scheduleBotAction(roomCode);
    });

    socket.on('rejoin_room', ({ roomCode, playerId }: { roomCode: string; playerId: string | null }) => {
      const room = rooms.get(roomCode);
      if (!room) { socket.emit('room_error', { message: 'Salle expirée.' }); return; }

      const member = room.members.find((m) => m.playerId === playerId);
      if (member) {
        socketToRoom.delete(member.socketId);
        member.socketId = socket.id;
      } else {
        room.members.push({ socketId: socket.id, playerId, playerName: '', isHost: false });
      }

      socketToRoom.set(socket.id, roomCode);
      socket.join(roomCode);
      socket.emit('room_joined', {
        roomCode,
        playerId,
        isHost: member?.isHost ?? false,
        state: room.gameState,
      });
      console.log('[rejoin]', roomCode, playerId);
    });

    socket.on('start_setup', ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      const member = room.members.find((m) => m.socketId === socket.id);
      if (!member?.isHost) return;
      const names = room.members
        .filter((m) => m.socketId && m.playerName)
        .map((m) => m.playerName);
      io.to(roomCode).emit('setup_started', { names });
      console.log('[setup_started]', roomCode, names);
    });

    socket.on('disconnect', () => {
      const roomCode = socketToRoom.get(socket.id);
      if (roomCode) {
        const room = rooms.get(roomCode);
        if (room) {
          const member = room.members.find((m) => m.socketId === socket.id);
          if (member) member.socketId = '';
          if (member?.isHost) {
            const next = room.members.find((m) => m.socketId && m.socketId !== socket.id);
            if (next) {
              next.isHost = true;
              io.to(next.socketId).emit('host_assigned');
            }
          }
          broadcastMembers(roomCode);
        }
        socketToRoom.delete(socket.id);
      }
      console.log('[disconnect]', socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`\n> Ready on http://localhost:${port} [${dev ? 'dev' : 'prod'}]\n`);
  });
});
