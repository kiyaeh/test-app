import { useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAppSelector, useAppDispatch } from '../store/index';
import { fetchStatsRequest } from '../store/statsSlice';

// ─── Animations ───────────────────────────────────────────────────────────────

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const barGrow = keyframes`
  from { width: 0; }
`;

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// ─── Stat cards ───────────────────────────────────────────────────────────────

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 860px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); gap: 10px; }
`;

interface StatCardProps { accent: string; glow: string; delay: number; }

const StatCard = styled.div<StatCardProps>`
  background: #131720;
  border: none;
  border-radius: 12px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  animation: ${rise} 0.32s ease both;
  animation-delay: ${({ delay }) => delay}ms;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  /* top accent line */
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: ${({ accent }) => accent};
    border-radius: 12px 12px 0 0;
  }

  /* ambient glow on hover */
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px ${({ glow }) => glow};
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const CardIcon = styled.div`
  font-size: 20px;
  line-height: 1;
`;

const CardBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #3D4A63;
`;

const CardValue = styled.p`
  font-size: 34px;
  font-weight: 700;
  color: #F0F4FF;
  margin: 0 0 4px;
  line-height: 1;
  letter-spacing: -1.5px;

  @media (max-width: 480px) { font-size: 26px; }
`;

const CardLabel = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: #6B7A99;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ─── Panels row ───────────────────────────────────────────────────────────────

const PanelsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;

  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 10px; }
`;

interface PanelProps { delay: number; }

const Panel = styled.div<PanelProps>`
  background: #131720;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  animation: ${rise} 0.32s ease both;
  animation-delay: ${({ delay }) => delay}ms;
`;

const PanelHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const PanelHeadIcon = styled.span`
  font-size: 14px;
`;

const PanelHeadTitle = styled.h3`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #6B7A99;
  margin: 0;
`;

const PanelBody = styled.div`
  padding: 6px 0;
  max-height: 300px;
  overflow-y: auto;
`;

const PRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 18px;
  gap: 10px;
  transition: background 0.1s ease;

  &:hover { background: rgba(255,255,255,0.025); }
`;

const PRowName = styled.span`
  font-size: 13px;
  color: #C8D3E8;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PRowMeta = styled.span`
  font-size: 11.5px;
  color: #3D4A63;
  white-space: nowrap;
  flex-shrink: 0;
`;

const CountBadge = styled.span`
  min-width: 22px;
  height: 18px;
  padding: 0 6px;
  border-radius: 9999px;
  background: rgba(139,92,246,0.14);
  color: #A78BFA;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

// ─── Bar chart ────────────────────────────────────────────────────────────────

const BarTrack = styled.div`
  flex: 1;
  height: 3px;
  background: rgba(255,255,255,0.05);
  border-radius: 2px;
  overflow: hidden;
`;

interface BarFillProps { pct: number; color: string; }

const BarFill = styled.div<BarFillProps>`
  height: 100%;
  width: ${({ pct }) => pct}%;
  background: ${({ color }) => color};
  border-radius: 2px;
  animation: ${barGrow} 0.7s ease both;
`;

// ─── Status ───────────────────────────────────────────────────────────────────

const StateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 10px;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 2.5px solid rgba(139,92,246,0.15);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
`;

const StateMsg = styled.p`
  font-size: 13px;
  color: #3D4A63;
`;

const ErrBox = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.2);
  color: #F87171;
  font-size: 13px;
`;

// ─── Bar colours ─────────────────────────────────────────────────────────────

const BAR_COLORS = [
  '#8B5CF6', '#F43F5E', '#06B6D4', '#F59E0B',
  '#10B981', '#3B82F6', '#EC4899', '#F97316',
];

// ─── Component ────────────────────────────────────────────────────────────────

export function StatsDashboard(): JSX.Element {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.stats);

  useEffect(() => { dispatch(fetchStatsRequest()); }, [dispatch]);

  if (loading) {
    return (
      <StateBox>
        <Spinner />
        <StateMsg>Loading statistics...</StateMsg>
      </StateBox>
    );
  }

  if (error) return <ErrBox role="alert">{error}</ErrBox>;

  if (!data) {
    return (
      <StateBox>
        <StateMsg>No statistics available.</StateMsg>
      </StateBox>
    );
  }

  const cards = [
    { label: 'Songs',   value: data.totalSongs,   icon: '🎵', accent: 'linear-gradient(90deg,#8B5CF6,#6D28D9)', glow: 'rgba(139,92,246,0.22)' },
    { label: 'Artists', value: data.totalArtists, icon: '🎤', accent: 'linear-gradient(90deg,#F43F5E,#BE123C)', glow: 'rgba(244,63,94,0.2)' },
    { label: 'Albums',  value: data.totalAlbums,  icon: '💿', accent: 'linear-gradient(90deg,#06B6D4,#0E7490)', glow: 'rgba(6,182,212,0.18)' },
    { label: 'Genres',  value: data.totalGenres,  icon: '🎸', accent: 'linear-gradient(90deg,#F59E0B,#B45309)', glow: 'rgba(245,158,11,0.18)' },
  ];

  const maxGenre = Math.max(...data.songsPerGenre.map((g) => g.count), 1);

  return (
    <Page aria-label="Statistics Dashboard">
      <CardsGrid>
        {cards.map(({ label, value, icon, accent, glow }, i) => (
          <StatCard key={label} accent={accent} glow={glow} delay={i * 55}>
            <CardTop>
              <CardIcon>{icon}</CardIcon>
              <CardBadge>Total</CardBadge>
            </CardTop>
            <CardValue>{value}</CardValue>
            <CardLabel>{label}</CardLabel>
          </StatCard>
        ))}
      </CardsGrid>

      <PanelsRow>
        {/* Songs per genre */}
        <Panel delay={240}>
          <PanelHead>
            <PanelHeadIcon>🎸</PanelHeadIcon>
            <PanelHeadTitle>Songs per Genre</PanelHeadTitle>
          </PanelHead>
          <PanelBody>
            {data.songsPerGenre.length === 0
              ? <PRow><PRowMeta>No data</PRowMeta></PRow>
              : data.songsPerGenre.map(({ genre, count }, i) => (
                  <PRow key={genre}>
                    <PRowName>{genre}</PRowName>
                    <BarTrack>
                      <BarFill pct={(count / maxGenre) * 100} color={BAR_COLORS[i % BAR_COLORS.length]} />
                    </BarTrack>
                    <CountBadge>{count}</CountBadge>
                  </PRow>
                ))
            }
          </PanelBody>
        </Panel>

        {/* Artists */}
        <Panel delay={300}>
          <PanelHead>
            <PanelHeadIcon>🎤</PanelHeadIcon>
            <PanelHeadTitle>Artists</PanelHeadTitle>
          </PanelHead>
          <PanelBody>
            {data.songsAndAlbumsPerArtist.length === 0
              ? <PRow><PRowMeta>No data</PRowMeta></PRow>
              : data.songsAndAlbumsPerArtist.map(({ artist, songCount, albumCount }) => (
                  <PRow key={artist}>
                    <PRowName>{artist}</PRowName>
                    <PRowMeta>
                      {songCount} song{songCount !== 1 ? 's' : ''} · {albumCount} album{albumCount !== 1 ? 's' : ''}
                    </PRowMeta>
                  </PRow>
                ))
            }
          </PanelBody>
        </Panel>

        {/* Albums */}
        <Panel delay={360}>
          <PanelHead>
            <PanelHeadIcon>💿</PanelHeadIcon>
            <PanelHeadTitle>Albums</PanelHeadTitle>
          </PanelHead>
          <PanelBody>
            {data.songsPerAlbum.length === 0
              ? <PRow><PRowMeta>No data</PRowMeta></PRow>
              : data.songsPerAlbum.map(({ album, count }) => (
                  <PRow key={album}>
                    <PRowName>{album}</PRowName>
                    <CountBadge>{count}</CountBadge>
                  </PRow>
                ))
            }
          </PanelBody>
        </Panel>
      </PanelsRow>
    </Page>
  );
}

export default StatsDashboard;
