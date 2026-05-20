import { useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAppSelector, useAppDispatch } from '../store/index';
import { deleteSongRequest } from '../store/songsSlice';
import type { Song } from '../types/song';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeRow = keyframes`
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Table ────────────────────────────────────────────────────────────────────

const Table = styled.div`
  width: 100%;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 110px 80px;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 2fr 1fr 110px 72px;
  }
`;

const TH = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  color: #3D4A63;
`;

interface TRowProps { idx: number; }

const TRow = styled.div<TRowProps>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 110px 80px;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.035);
  animation: ${fadeRow} 0.22s ease both;
  animation-delay: ${({ idx }) => Math.min(idx * 35, 280)}ms;
  transition: background 0.12s ease;

  &:hover { background: rgba(255,255,255,0.025); }
  &:last-child { border-bottom: none; }

  @media (max-width: 860px) {
    grid-template-columns: 2fr 1fr 110px 72px;
  }
`;

// ─── Song cell ────────────────────────────────────────────────────────────────

const SongCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

interface ArtworkProps { hue: number; }

const Artwork = styled.div<ArtworkProps>`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  background: ${({ hue }) =>
    `linear-gradient(135deg, hsl(${hue},40%,14%) 0%, hsl(${hue},50%,18%) 100%)`};
  border: 1px solid ${({ hue }) => `hsla(${hue},60%,60%,0.12)`};
`;

const SongMeta = styled.div`
  min-width: 0;
`;

const SongName = styled.p`
  font-size: 13.5px;
  font-weight: 600;
  color: #E8EDF5;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SongSub = styled.p`
  font-size: 12px;
  color: #6B7A99;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ─── Generic cell text ────────────────────────────────────────────────────────

const Cell = styled.span`
  font-size: 13px;
  color: #6B7A99;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

  @media (max-width: 860px) {
    &.album-col { display: none; }
  }
`;

// ─── Genre pill ───────────────────────────────────────────────────────────────

interface PillProps { hue: number; }

const Pill = styled.span<PillProps>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  background: ${({ hue }) => `hsla(${hue},70%,65%,0.12)`};
  color: ${({ hue }) => `hsl(${hue},80%,72%)`};
  border: 1px solid ${({ hue }) => `hsla(${hue},70%,65%,0.22)`};
`;

// ─── Action buttons ───────────────────────────────────────────────────────────

const Actions = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
`;

interface ActionBtnProps { danger?: boolean; }

const ActionBtn = styled.button<ActionBtnProps>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid ${({ danger }) =>
    danger ? 'rgba(248,113,113,0.18)' : 'rgba(139,92,246,0.2)'};
  background: ${({ danger }) =>
    danger ? 'rgba(248,113,113,0.07)' : 'rgba(139,92,246,0.08)'};
  color: ${({ danger }) => (danger ? '#F87171' : '#A78BFA')};
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.13s ease;

  &:hover {
    background: ${({ danger }) =>
      danger ? 'rgba(248,113,113,0.16)' : 'rgba(139,92,246,0.18)'};
    transform: scale(1.1);
  }
  &:focus-visible { outline: 2px solid #8B5CF6; outline-offset: 2px; }
`;

// ─── States ───────────────────────────────────────────────────────────────────

const StateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 24px;
  gap: 10px;
`;

const StateEmoji = styled.div`
  font-size: 36px;
  opacity: 0.35;
`;

const StateMsg = styled.p`
  font-size: 13.5px;
  color: #3D4A63;
  text-align: center;
  max-width: 280px;
  line-height: 1.6;
`;

const Spinner = styled.div`
  width: 30px;
  height: 30px;
  border: 2.5px solid rgba(139,92,246,0.15);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
`;

const ErrBox = styled.div`
  margin: 16px 20px;
  padding: 11px 15px;
  border-radius: 8px;
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.22);
  color: #F87171;
  font-size: 13px;
`;

// ─── Genre hue map (no special chars in keys) ─────────────────────────────────

function genreHue(genre: string): number {
  const map: Record<string, number> = {
    jazz: 45, pop: 330, rock: 0, classical: 175,
    hiphop: 270, blues: 210, rnb: 150, soul: 30,
    electronic: 195, country: 80, reggae: 120, metal: 15,
  };
  const key = genre.toLowerCase().replace(/[^a-z]/g, '');
  return map[key] ?? ((genre.charCodeAt(0) * 47 + genre.charCodeAt(genre.length - 1) * 31) % 360);
}

function genreEmoji(genre: string): string {
  const map: Record<string, string> = {
    jazz: '🎷', pop: '🎤', rock: '🎸', classical: '🎻',
    hiphop: '�', blues: '🎵', rnb: '🎶', soul: '🎙',
    electronic: '🎛', country: '🤠', reggae: '�', metal: '🤘',
  };
  const key = genre.toLowerCase().replace(/[^a-z]/g, '');
  return map[key] ?? '🎵';
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SongListProps {
  onEdit: (song: Song) => void;
}

export function SongList({ onEdit }: SongListProps): JSX.Element {
  const dispatch = useAppDispatch();
  const songs = useAppSelector((s) => s.songs.songs);
  const loading = useAppSelector((s) => s.songs.loading);
  const error = useAppSelector((s) => s.songs.error);
  const selectedGenre = useAppSelector((s) => s.songs.selectedGenre);

  const displayed = useMemo<Song[]>(() => {
    if (!selectedGenre) return songs;
    return songs.filter((s) => s.genre === selectedGenre);
  }, [songs, selectedGenre]);

  if (loading) {
    return (
      <StateBox>
        <Spinner />
        <StateMsg>Loading songs...</StateMsg>
      </StateBox>
    );
  }

  if (error) {
    return <ErrBox role="alert">{error}</ErrBox>;
  }

  if (displayed.length === 0) {
    return (
      <StateBox>
        <StateEmoji>🎵</StateEmoji>
        <StateMsg>
          {selectedGenre
            ? `No songs in "${selectedGenre}". Try a different genre or clear the filter.`
            : 'Your library is empty. Add your first song to get started.'}
        </StateMsg>
      </StateBox>
    );
  }

  return (
    <Table>
      <THead>
        <TH>Title</TH>
        <TH>Artist</TH>
        <TH className="album-col">Album</TH>
        <TH>Genre</TH>
        <TH></TH>
      </THead>

      {displayed.map((song, idx) => {
        const hue = genreHue(song.genre);
        const emoji = genreEmoji(song.genre);

        return (
          <TRow key={song._id} idx={idx}>
            <SongCell>
              <Artwork hue={hue}>{emoji}</Artwork>
              <SongMeta>
                <SongName>{song.title}</SongName>
                <SongSub>{song.artist}</SongSub>
              </SongMeta>
            </SongCell>

            <Cell>{song.artist}</Cell>

            <Cell className="album-col">{song.album}</Cell>

            <Pill hue={hue}>{song.genre}</Pill>

            <Actions>
              <ActionBtn
                onClick={() => onEdit(song)}
                aria-label={`Edit ${song.title}`}
                title="Edit"
              >
                ✏
              </ActionBtn>
              <ActionBtn
                danger
                onClick={() => dispatch(deleteSongRequest(song._id))}
                aria-label={`Delete ${song.title}`}
                title="Delete"
              >
                ✕
              </ActionBtn>
            </Actions>
          </TRow>
        );
      })}
    </Table>
  );
}

export default SongList;
