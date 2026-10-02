"use client";

// My Notes needs its own Client Component only so each note can flip into
// an editable textarea in place — everything else on the entry page is
// plain server-rendered HTML.

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createNote, updateNote, deleteNote } from "@/app/actions/notes";

type Note = { id: string; content: string; updatedAt: string };

const inputClass =
  "w-full rounded-md border border-white/10 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-accent";

function NoteRow({ note, entrySlug }: { note: Note; entrySlug: string }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (fd) => {
          await updateNote(fd);
          setEditing(false);
        }}
        className="space-y-2"
      >
        <input type="hidden" name="id" value={note.id} />
        <input type="hidden" name="slug" value={entrySlug} />
        <textarea name="content" required rows={3} defaultValue={note.content} className={inputClass} autoFocus />
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-light">
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="group rounded-md border border-white/10 bg-[#0f1115] p-3">
      <p className="whitespace-pre-wrap text-sm text-gray-300">{note.content}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-600">{new Date(note.updatedAt).toLocaleString()}</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-accent" title="Edit">
            <Pencil size={14} />
          </button>
          <form action={deleteNote}>
            <input type="hidden" name="id" value={note.id} />
            <input type="hidden" name="slug" value={entrySlug} />
            <button type="submit" className="text-gray-500 hover:text-red-400" title="Delete">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EntryNotes({ entryId, entrySlug, notes }: { entryId: string; entrySlug: string; notes: Note[] }) {
  return (
    <div className="space-y-3">
      {notes.map((n) => (
        <NoteRow key={n.id} note={n} entrySlug={entrySlug} />
      ))}

      <form action={createNote} className="space-y-2">
        <input type="hidden" name="entryId" value={entryId} />
        <input type="hidden" name="slug" value={entrySlug} />
        <textarea
          name="content"
          required
          rows={3}
          placeholder="A mistake you made, something you finally understood, a lab observation…"
          className={inputClass}
        />
        <button type="submit" className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/5">
          Add note
        </button>
      </form>
    </div>
  );
}
