import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAppDispatch } from '../store';
import { createSongRequest, updateSongRequest } from '../store/songsSlice';
import type { Song } from '../types/song';

// ─── Form shell ───────────────────────────────────────────────────────────────

const Form = styled.form`
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

// ─── Field grid — stacked (full-width) for clarity ───────────────────────────

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: #8B9BB8;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LabelIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`;

// ─── Input wrapper — gives us the left-border accent + icon slot ──────────────

interface WrapProps { err?: boolean; focused?: boolean; }

const InputWrap = styled.div<WrapProps>`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 9px;
  border: 1.5px solid ${({ err, focused }) =>
    err
      ? 'rgba(248,113,113,0.55)'
      : focused
      ? 'rgba(139,92,246,0.65)'
      : 'rgba(255,255,255,0.12)'};
  background: ${({ err, focused }) =>
    err
      ? 'rgba(248,113,113,0.06)'
      : focused
      ? 'rgba(139,92,246,0.07)'
      : '#1C2235'};
  box-shadow: ${({ err, focused }) =>
    err
      ? '0 0 0 3px rgba(248,113,113,0.1)'
      : focused
      ? '0 0 0 3px rgba(139,92,246,0.13)'
      : 'none'};
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
`;

const InputIcon = styled.span`
  padding: 0 0 0 13px;
  font-size: 15px;
  line-height: 1;
  flex-shrink: 0;
  pointer-events: none;
  opacity: 0.55;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 11px 13px;
  background: transparent;
  border: none;
  outline: none;
  color: #F0F4FF;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.1px;
  width: 100%;

  &::placeholder {
    color: #3D4A63;
    font-weight: 400;
  }

  /* kill browser autofill yellow */
  &:-webkit-autofill,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 100px #1C2235 inset;
    -webkit-text-fill-color: #F0F4FF;
    caret-color: #F0F4FF;
  }
`;

const ErrMsg = styled.span`
  font-size: 11.5px;
  color: #F87171;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '⚠';
    font-size: 10px;
  }
`;

// ─── Divider ──────────────────────────────────────────────────────────────────

const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.06);
`;

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelBtn = styled.button`
  padding: 9px 18px;
  border-radius: 8px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #8B9BB8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.14s ease;

  &:hover {
    border-color: rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.05);
    color: #E8EDF5;
  }
`;

const SaveBtn = styled.button`
  padding: 9px 22px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.15px;
  box-shadow: 0 2px 14px rgba(139,92,246,0.4);
  transition: all 0.14s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 22px rgba(139,92,246,0.55);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 8px rgba(139,92,246,0.3);
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SongFormProps {
  song?: Song;
  onSuccess?: () => void;
}

type Errs = Record<string, string>;

// ─── Field config ─────────────────────────────────────────────────────────────

const FIELDS = [
  { key: 'title',  id: 'song-title',  label: 'Song Title', icon: '🎵', placeholder: 'e.g. Bohemian Rhapsody' },
  { key: 'artist', id: 'song-artist', label: 'Artist',     icon: '🎤', placeholder: 'e.g. Queen' },
  { key: 'album',  id: 'song-album',  label: 'Album',      icon: '💿', placeholder: 'e.g. A Night at the Opera' },
  { key: 'genre',  id: 'song-genre',  label: 'Genre',      icon: '🎸', placeholder: 'e.g. Rock' },
] as const;

type FieldKey = typeof FIELDS[number]['key'];

// ─── Component ────────────────────────────────────────────────────────────────

export function SongForm({ song, onSuccess }: SongFormProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [values, setValues] = useState<Record<FieldKey, string>>({
    title:  song?.title  ?? '',
    artist: song?.artist ?? '',
    album:  song?.album  ?? '',
    genre:  song?.genre  ?? '',
  });
  const [errs,    setErrs]    = useState<Errs>({});
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    setValues({
      title:  song?.title  ?? '',
      artist: song?.artist ?? '',
      album:  song?.album  ?? '',
      genre:  song?.genre  ?? '',
    });
    setErrs({});
    setFocused(null);
  }, [song]);

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (errs[key]) setErrs((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validate = (): Errs => {
    const e: Errs = {};
    if (!values.title.trim())  e.title  = 'Title is required';
    if (!values.artist.trim()) e.artist = 'Artist is required';
    if (!values.album.trim())  e.album  = 'Album is required';
    if (!values.genre.trim())  e.genre  = 'Genre is required';
    return e;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrs(v); return; }

    const data = {
      title:  values.title.trim(),
      artist: values.artist.trim(),
      album:  values.album.trim(),
      genre:  values.genre.trim(),
    };

    if (song) {
      dispatch(updateSongRequest({ id: song._id, data }));
    } else {
      dispatch(createSongRequest(data));
    }

    setValues({ title: '', artist: '', album: '', genre: '' });
    setErrs({});
    onSuccess?.();
  };

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label={song ? 'Edit song' : 'Add song'}>
      <Fields>
        {FIELDS.map(({ key, id, label, icon, placeholder }) => (
          <Field key={key}>
            <FieldLabel htmlFor={id}>
              <LabelIcon>{icon}</LabelIcon>
              {label}
            </FieldLabel>

            <InputWrap err={Boolean(errs[key])} focused={focused === key}>
              <InputIcon>{icon}</InputIcon>
              <StyledInput
                id={id}
                type="text"
                value={values[key]}
                onChange={set(key)}
                placeholder={placeholder}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused(null)}
                aria-invalid={Boolean(errs[key])}
                aria-describedby={errs[key] ? `err-${key}` : undefined}
              />
            </InputWrap>

            {errs[key] && (
              <ErrMsg id={`err-${key}`} role="alert">
                {errs[key]}
              </ErrMsg>
            )}
          </Field>
        ))}
      </Fields>

      <Divider />

      <Footer>
        {onSuccess && (
          <CancelBtn type="button" onClick={onSuccess}>
            Cancel
          </CancelBtn>
        )}
        <SaveBtn type="submit">
          {song ? '✓ Update Song' : '+ Add Song'}
        </SaveBtn>
      </Footer>
    </Form>
  );
}

export default SongForm;
