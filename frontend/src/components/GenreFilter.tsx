import { useMemo } from 'react';
import styled from '@emotion/styled';
import { useAppSelector, useAppDispatch } from '../store/index';
import { setSelectedGenre } from '../store/songsSlice';

// ─── Styled ───────────────────────────────────────────────────────────────────

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
`;

const Label = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  color: #3D4A63;
  margin-right: 2px;
`;

interface ChipProps { active: boolean; }

const Chip = styled.button<ChipProps>`
  padding: 5px 13px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  cursor: pointer;
  transition: all 0.13s ease;
  white-space: nowrap;
  border: 1px solid ${({ active }) =>
    active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.07)'};
  background: ${({ active }) =>
    active
      ? 'linear-gradient(135deg,rgba(139,92,246,0.22),rgba(109,40,217,0.18))'
      : 'rgba(255,255,255,0.03)'};
  color: ${({ active }) => (active ? '#C4B5FD' : '#6B7A99')};
  box-shadow: ${({ active }) =>
    active ? '0 0 10px rgba(139,92,246,0.18)' : 'none'};

  &:hover {
    border-color: rgba(139,92,246,0.4);
    color: #C4B5FD;
    background: rgba(139,92,246,0.1);
  }
  &:focus-visible { outline: 2px solid #8B5CF6; outline-offset: 2px; }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function GenreFilter(): JSX.Element {
  const dispatch = useAppDispatch();
  const songs = useAppSelector((s) => s.songs.songs);
  const selected = useAppSelector((s) => s.songs.selectedGenre);

  const genres = useMemo<string[]>(() => {
    const set = new Set<string>(songs.map((s) => s.genre));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [songs]);

  if (genres.length === 0) return <></>;

  return (
    <Bar role="group" aria-label="Filter by genre">
      <Label>Genre</Label>

      <Chip
        active={selected === null}
        onClick={() => dispatch(setSelectedGenre(null))}
        aria-pressed={selected === null}
      >
        All
      </Chip>

      {genres.map((g) => (
        <Chip
          key={g}
          active={selected === g}
          onClick={() => dispatch(setSelectedGenre(g))}
          aria-pressed={selected === g}
        >
          {g}
        </Chip>
      ))}
    </Bar>
  );
}

export default GenreFilter;
