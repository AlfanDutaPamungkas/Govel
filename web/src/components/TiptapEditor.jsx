import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";

const TiptapEditor = ({ value, onChange }) => {
  const prevValue = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder: "Tulis isi chapter di sini...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== prevValue.current) {
        prevValue.current = html;
        onChange(html);
      }
    },
  });

  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      value &&
      value !== prevValue.current &&
      value !== editor.getHTML()
    ) {
      editor.commands.setContent(value, false);
      prevValue.current = value;
    }
  }, [editor, value]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, label, isActive }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick(); // langsung run di handler
      }}
      className={`px-2 py-1 rounded text-sm ${
        isActive ? "bg-blue-600 text-white" : "hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="border rounded">
      <div className="border-b px-2 py-2 bg-gray-50 flex flex-wrap gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
          isActive={editor.isActive("bold")}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
          isActive={editor.isActive("italic")}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label="S"
          isActive={editor.isActive("strike")}
        />
      </div>

      <EditorContent editor={editor} className="prose"/>
    </div>
  );
};

export default TiptapEditor;
