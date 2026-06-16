import { useNotes } from '../context/NotesContext';

interface NoteCountProps {
  label?: string;
}

export default function NoteCount({ label = '노트' }: NoteCountProps) {
  const { notes, loading } = useNotes();

  if (loading) {
    return <span className="text-xs text-muted-foreground">불러오는 중…</span>;
  }

  const isEmpty = notes.length === 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isEmpty ? 'bg-muted text-muted-foreground' : 'bg-card text-foreground border border-border'
      }`}
    >
      {label}
      <span className="font-semibold">{notes.length}</span>
    </span>
  );
}
