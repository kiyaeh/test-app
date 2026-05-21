import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { store, useAppDispatch } from './store';
import { ThemeProvider } from './theme/ThemeProvider';
import { SongForm } from './components/SongForm';
import { SongList } from './components/SongList';
import { GenreFilter } from './components/GenreFilter';
import { StatsDashboard } from './components/StatsDashboard';
import { fetchSongsRequest } from './store/songsSlice';
import type { Song } from './types/song';

// ─── Animations ───────────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const backdropIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Shell ────────────────────────────────────────────────────────────────────

const Shell = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #080B12;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = styled.aside`
  width: 240px;
  flex-shrink: 0;
  background: #0E1118;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;

  @media (max-width: 768px) { display: none; }
`;

const SidebarTop = styled.div`
  padding: 28px 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
`;

const BrandMark = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #8B5CF6 0%, #F43F5E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 0 18px rgba(139,92,246,0.45);
`;

const BrandName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #F0F4FF;
  letter-spacing: -0.3px;
`;

const BrandSub = styled.span`
  font-size: 10px;
  color: #3D4A63;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: block;
  margin-top: 1px;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavGroup = styled.div`
  margin-bottom: 20px;
`;

const NavGroupLabel = styled.p`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #3D4A63;
  padding: 0 8px;
  margin-bottom: 4px;
`;

interface NavBtnProps { active?: boolean; }

const NavBtn = styled.button<NavBtnProps>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  color: ${({ active }) => (active ? '#F0F4FF' : '#6B7A99')};
  background: ${({ active }) =>
    active ? 'rgba(139,92,246,0.15)' : 'transparent'};
  position: relative;
  transition: all 0.14s ease;
  text-align: left;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${({ active }) => (active ? '60%' : '0')};
    background: linear-gradient(180deg, #8B5CF6, #F43F5E);
    border-radius: 0 2px 2px 0;
    transition: height 0.2s ease;
  }

  &:hover {
    background: rgba(255,255,255,0.04);
    color: #E8EDF5;
  }
`;

const NavIcon = styled.span`
  font-size: 15px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
`;

const SidebarBottom = styled.div`
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
`;

const VersionTag = styled.p`
  font-size: 11px;
  color: #3D4A63;
`;

// ─── Main ─────────────────────────────────────────────────────────────────────

const Main = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 60px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(8,11,18,0.85);
  backdrop-filter: blur(16px);
  position: relative;
  z-index: 5;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const PageHeading = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #F0F4FF;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
  box-shadow: 0 2px 12px rgba(139,92,246,0.35);
  transition: all 0.15s ease;
  letter-spacing: 0.1px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(139,92,246,0.5);
  }
  &:active { transform: translateY(0); }
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 16px;
    padding-bottom: 80px; /* space for mobile bottom nav */
  }
`;

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const Card = styled.div`
  background: #131720;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  animation: ${slideIn} 0.28s ease both;
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.72);
  backdrop-filter: blur(6px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${backdropIn} 0.18s ease;
`;

const Modal = styled.div`
  background: #131720;
  border: 1px solid rgba(139,92,246,0.25);
  border-radius: 14px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(139,92,246,0.12);
  animation: ${slideIn} 0.22s ease;
  overflow: hidden;
`;

const ModalHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 0;
`;

const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #F0F4FF;
  letter-spacing: -0.2px;
`;

const CloseBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #6B7A99;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.14s ease;

  &:hover { background: rgba(255,255,255,0.09); color: #E8EDF5; }
`;

// ─── Mobile bottom nav ────────────────────────────────────────────────────────

const MobileNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #0E1118;
    border-top: 1px solid rgba(255,255,255,0.07);
    z-index: 20;
  }
`;

interface MobileNavBtnProps { active?: boolean; }

const MobileNavBtn = styled.button<MobileNavBtnProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ active }) => (active ? '#A78BFA' : '#3D4A63')};
  font-size: 11px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  font-family: inherit;
  transition: color 0.14s ease;

  &:active { opacity: 0.7; }
`;

const MobileNavIcon = styled.span`
  font-size: 20px;
  line-height: 1;
`;

// ─── View type ────────────────────────────────────────────────────────────────

type View = 'library' | 'stats';

// ─── Inner app ────────────────────────────────────────────────────────────────

function AppContent(): JSX.Element {
  const dispatch = useAppDispatch();
  const [view, setView] = useState<View>('library');
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | undefined>(undefined);

  useEffect(() => { dispatch(fetchSongsRequest()); }, [dispatch]);

  const openAdd = (): void => { setEditingSong(undefined); setShowForm(true); };
  const openEdit = (s: Song): void => { setEditingSong(s); setShowForm(true); };
  const closeForm = (): void => { setShowForm(false); setEditingSong(undefined); };

  return (
    <Shell>
      <Sidebar>
        <SidebarTop>
          <Brand>
            <BrandMark>🎵</BrandMark>
            <div>
              <BrandName>Addis Music</BrandName>
              <BrandSub>Music Manager</BrandSub>
            </div>
          </Brand>
        </SidebarTop>

        <Nav>
          <NavGroup>
            <NavGroupLabel>Discover</NavGroupLabel>
            <NavBtn active={view === 'library'} onClick={() => setView('library')}>
              <NavIcon>🎧</NavIcon> Library
            </NavBtn>
            <NavBtn active={view === 'stats'} onClick={() => setView('stats')}>
              <NavIcon>📊</NavIcon> Statistics
            </NavBtn>
          </NavGroup>
        </Nav>

        <SidebarBottom>
          <VersionTag>Addis Music v1.0</VersionTag>
        </SidebarBottom>
      </Sidebar>

      <Main>
        <TopBar>
          <PageHeading>
            {view === 'library' ? <><span>🎧</span> Library</> : <><span>📊</span> Statistics</>}
          </PageHeading>
          <TopActions>
            {view === 'library' && (
              <AddBtn onClick={openAdd}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Song
              </AddBtn>
            )}
          </TopActions>
        </TopBar>

        <ScrollArea>
          {view === 'library' && (
            <>
              <GenreFilter />
              <Card><SongList onEdit={openEdit} /></Card>
            </>
          )}
          {view === 'stats' && <StatsDashboard />}
        </ScrollArea>
      </Main>

      {showForm && (
        <Backdrop onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <Modal>
            <ModalHead>
              <ModalTitle>{editingSong ? 'Edit Song' : 'Add New Song'}</ModalTitle>
              <CloseBtn onClick={closeForm} aria-label="Close">✕</CloseBtn>
            </ModalHead>
            <SongForm song={editingSong} onSuccess={closeForm} />
          </Modal>
        </Backdrop>
      )}

      <MobileNav>
        <MobileNavBtn active={view === 'library'} onClick={() => setView('library')}>
          <MobileNavIcon>🎧</MobileNavIcon>
          Library
        </MobileNavBtn>
        <MobileNavBtn active={view === 'stats'} onClick={() => setView('stats')}>
          <MobileNavIcon>📊</MobileNavIcon>
          Statistics
        </MobileNavBtn>
      </MobileNav>
    </Shell>
  );
}

export default function App(): JSX.Element {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}
