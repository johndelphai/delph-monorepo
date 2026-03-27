'use client';
import { useCharactersStore } from '@repo/common/store';
import { useChatStore } from '@repo/common/store';
import { Character } from '@repo/shared/types';
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    Input,
    Textarea,
} from '@repo/ui';
import {
    IconEdit,
    IconMessageCircle,
    IconPlus,
    IconSparkles,
    IconTrash,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const PUBLIC_CHARACTERS: Omit<Character, 'createdAt' | 'updatedAt'>[] = [
    {
        id: 'public-socrates',
        name: 'Socrates',
        emoji: '🏛️',
        description: 'Explores ideas through questions rather than answers.',
        instructions:
            'You are Socrates, the ancient Greek philosopher. You never lecture directly   instead, guide through questions. Challenge assumptions, expose contradictions, and help the user arrive at truth themselves. Use the Socratic method.',
    },
    {
        id: 'public-einstein',
        name: 'Einstein',
        emoji: '⚛️',
        description: 'Explains complex physics and science with vivid analogies.',
        instructions:
            'You are Albert Einstein. Explain science and physics with thought experiments and vivid analogies. Be curious, humble, and imaginative. Relate abstract concepts to everyday experience. Occasionally reference your own discoveries when relevant.',
    },
    {
        id: 'public-devil',
        name: "Devil's Advocate",
        emoji: '😈',
        description: 'Argues the strongest case against your position.',
        instructions:
            "You are a devil's advocate. Your job is to argue the strongest possible case against whatever position the user takes. Be rigorous, find flaws in their reasoning, and push back on assumptions. You are not being contrarian   you are stress-testing their thinking.",
    },
    {
        id: 'public-therapist',
        name: 'Therapist',
        emoji: '🧘',
        description: 'Listens deeply and reflects back with empathy.',
        instructions:
            'You are a skilled therapist using reflective listening and cognitive-behavioral techniques. Do not give direct advice unless asked. Instead, ask open questions, reflect feelings back, and help the user explore their own thoughts. Be warm, non-judgmental, and patient.',
    },
    {
        id: 'public-marcus',
        name: 'Marcus Aurelius',
        emoji: '📜',
        description: 'Offers stoic wisdom on adversity, duty, and the good life.',
        instructions:
            'You are Marcus Aurelius, Roman emperor and Stoic philosopher. Offer wisdom grounded in Stoic philosophy   virtue, duty, the dichotomy of control, impermanence, and rational living. Draw on your Meditations. Be calm, direct, and measured.',
    },
    {
        id: 'public-chef',
        name: 'Chef',
        emoji: '👨‍🍳',
        description: 'Passionate, precise cooking advice for all skill levels.',
        instructions:
            'You are a world-class chef with deep knowledge of global cuisines. Give practical, passionate cooking advice. Explain the "why" behind techniques. Be encouraging to beginners but do not dumb things down. Share tips that make a real difference.',
    },
    {
        id: 'public-cto',
        name: 'CTO Advisor',
        emoji: '💻',
        description: 'Senior technical leadership perspective on architecture and trade-offs.',
        instructions:
            'You are a seasoned CTO with 20+ years of experience building and scaling software systems. Give direct, opinionated technical advice. Focus on trade-offs, scalability, team dynamics, and long-term maintainability. Be pragmatic over idealistic.',
    },
    {
        id: 'public-editor',
        name: 'Editor',
        emoji: '✍️',
        description: 'Sharp, specific feedback to make your writing stronger.',
        instructions:
            'You are a sharp, experienced editor. Give specific, actionable feedback on writing. Point out weak sentences, vague language, structural problems, and missed opportunities. Be direct and honest   do not soften feedback to protect feelings. Rewrite sections when helpful.',
    },
];

type CharacterFormData = {
    name: string;
    emoji: string;
    description: string;
    instructions: string;
};

const EMPTY_FORM: CharacterFormData = {
    name: '',
    emoji: '🤖',
    description: '',
    instructions: '',
};

const EMOJI_OPTIONS = ['🤖', '🧠', '👾', '🦊', '🐉', '🌟', '⚡', '🔮', '🎭', '🧙', '👽', '🦁'];

export default function CharactersPage() {
    const { characters, isLoaded, loadCharacters, createCharacter, updateCharacter, deleteCharacter } =
        useCharactersStore();
    const setActiveCharacter = useChatStore(state => state.setActiveCharacter);
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CharacterFormData>(EMPTY_FORM);

    useEffect(() => {
        if (!isLoaded) loadCharacters();
    }, [isLoaded, loadCharacters]);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEdit = (char: Character) => {
        setEditingId(char.id);
        setForm({ name: char.name, emoji: char.emoji, description: char.description, instructions: char.instructions });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.instructions.trim()) return;
        if (editingId) {
            await updateCharacter(editingId, form);
        } else {
            await createCharacter(form);
        }
        setIsModalOpen(false);
        setForm(EMPTY_FORM);
    };

    const startChat = (char: Character | Omit<Character, 'createdAt' | 'updatedAt'>) => {
        const fullChar: Character = {
            ...char,
            createdAt: (char as Character).createdAt ?? new Date(),
            updatedAt: (char as Character).updatedAt ?? new Date(),
        };
        setActiveCharacter(fullChar);
        router.push('/chat');
    };

    return (
        <div className="no-scrollbar h-full w-full overflow-y-auto">
            <div className="mx-auto max-w-5xl px-6 py-10">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Characters</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Custom AIs with unique personalities. Chats are stored locally, never on any server.
                        </p>
                    </div>
                    <Button onClick={openCreate} rounded="full" size="sm">
                        <IconPlus size={15} strokeWidth={2} />
                        New Character
                    </Button>
                </div>

                {/* User Characters */}
                {characters.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-widest">
                            My Characters
                        </h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {characters.map((char, i) => (
                                <CharacterCard
                                    key={char.id}
                                    character={char}
                                    index={i}
                                    onChat={() => startChat(char)}
                                    onEdit={() => openEdit(char)}
                                    onDelete={() => deleteCharacter(char.id)}
                                    isOwned
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Public Characters */}
                <section>
                    <h2 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-widest">
                        Public Characters
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {PUBLIC_CHARACTERS.map((char, i) => (
                            <CharacterCard
                                key={char.id}
                                character={char as Character}
                                index={i}
                                onChat={() => startChat(char)}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {/* Create / Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent ariaTitle={editingId ? 'Edit Character' : 'New Character'} className="!max-w-lg">
                    <div className="flex flex-col gap-5">
                        <h3 className="text-lg font-bold">
                            {editingId ? 'Edit Character' : 'New Character'}
                        </h3>

                        {/* Emoji picker */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Avatar</label>
                            <div className="flex flex-wrap gap-2">
                                {EMOJI_OPTIONS.map(e => (
                                    <button
                                        key={e}
                                        onClick={() => setForm(f => ({ ...f, emoji: e }))}
                                        className={`rounded-lg p-2 text-xl transition-colors ${
                                            form.emoji === e
                                                ? 'bg-foreground/10 ring-foreground ring-2'
                                                : 'hover:bg-foreground/5'
                                        }`}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                placeholder="e.g. Stoic Advisor"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Short description</label>
                            <Input
                                placeholder="One line about this character"
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Instructions</label>
                            <textarea
                                className="border-border bg-background focus:ring-ring placeholder:text-muted-foreground min-h-[140px] w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1"
                                placeholder="Describe how this character should behave, speak, and respond..."
                                value={form.instructions}
                                onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-border mt-4 border-t pt-4">
                        <Button variant="bordered" rounded="full" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            rounded="full"
                            onClick={handleSave}
                            disabled={!form.name.trim() || !form.instructions.trim()}
                        >
                            {editingId ? 'Save Changes' : 'Create Character'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

type CharacterCardProps = {
    character: Character;
    index: number;
    onChat: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isOwned?: boolean;
};

function CharacterCard({ character, index, onChat, onEdit, onDelete, isOwned }: CharacterCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="bg-secondary border-border group flex flex-col gap-3 rounded-xl border p-4 transition-shadow hover:shadow-sm"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="bg-background border-border flex size-11 shrink-0 items-center justify-center rounded-xl border text-2xl">
                        {character.emoji}
                    </div>
                    <div>
                        <p className="font-semibold leading-tight">{character.name}</p>
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                            {character.description}
                        </p>
                    </div>
                </div>
                {isOwned && (
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon-sm" onClick={onEdit} tooltip="Edit">
                            <IconEdit size={13} strokeWidth={2} />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={onDelete} tooltip="Delete">
                            <IconTrash size={13} strokeWidth={2} className="text-destructive" />
                        </Button>
                    </div>
                )}
            </div>
            <Button
                variant="bordered"
                size="sm"
                rounded="lg"
                className="w-full justify-center"
                onClick={onChat}
            >
                <IconMessageCircle size={14} strokeWidth={2} />
                Chat
            </Button>
        </motion.div>
    );
}
