"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Layers,
  LayoutGrid,
  Inbox,
  PenTool,
  Cpu,
  Plus,
  ScrollText,
  UploadCloud,
  DownloadCloud,
  Trash2,
  Download,
  GraduationCap,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Note = {
  id: number
  content: string
  category: string
  tags: string[]
  date: string
}

type Category = {
  id: string
  label: string
  icon: typeof Inbox
  emoji: string
}

const categories: Category[] = [
  { id: "📥 Entrada", label: "Entrada", icon: Inbox, emoji: "📥" },
  { id: "✍️ Escrita", label: "Escrita", icon: PenTool, emoji: "✍️" },
  { id: "🗃️ Fontes", label: "Fontes", icon: ScrollText, emoji: "🗃️" },
  { id: "🤖 IA", label: "Lab / IA", icon: Cpu, emoji: "🤖" },
]

export default function SistematizaApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [currentFilter, setCurrentFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("📥 Entrada")
  const [tags, setTags] = useState("")
  const [styleGuide, setStyleGuide] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load data on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("sistematiza_v1")
    const savedStyle = localStorage.getItem("sistematiza_style")
    if (savedNotes) setNotes(JSON.parse(savedNotes))
    if (savedStyle) setStyleGuide(savedStyle)
  }, [])

  // Filter notes
  useEffect(() => {
    let filtered = notes
    if (currentFilter !== "all") {
      filtered = filtered.filter((note) => note.category === currentFilter)
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }
    setFilteredNotes(filtered)
  }, [notes, currentFilter, searchQuery])

  const saveNote = () => {
    if (!noteContent.trim()) return

    const newNote: Note = {
      id: Date.now(),
      content: noteContent,
      category: selectedCategory,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      date: new Date().toLocaleString("pt-BR"),
    }

    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)
    localStorage.setItem("sistematiza_v1", JSON.stringify(updatedNotes))

    setNoteContent("")
    setTags("")
    setIsModalOpen(false)
  }

  const deleteNote = (id: number) => {
    if (!confirm("Deseja excluir este registro?")) return
    const updatedNotes = notes.filter((n) => n.id !== id)
    setNotes(updatedNotes)
    localStorage.setItem("sistematiza_v1", JSON.stringify(updatedNotes))
  }

  const exportMD = (id: number) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    const md = `# ${note.category}\nData: ${note.date}\n\n${note.content}`
    const blob = new Blob([md], { type: "text/markdown" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `nota_${id}.md`
    a.click()
  }

  const exportFullBackup = () => {
    const data = localStorage.getItem("sistematiza_v1")
    if (!data) {
      alert("Nenhum dado para exportar.")
      return
    }
    const blob = new Blob([data], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `sistematiza_backup_${Date.now()}.json`
    a.click()
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (confirm("Substituir acervo atual?")) {
          setNotes(imported)
          localStorage.setItem("sistematiza_v1", JSON.stringify(imported))
        }
      } catch (err) {
        alert("Erro ao importar arquivo.")
      }
    }
    reader.readAsText(file)
  }

  const saveStyle = () => {
    localStorage.setItem("sistematiza_style", styleGuide)
    setIsStyleModalOpen(false)
  }

  const getViewTitle = () => {
    if (currentFilter === "all") return "Acervo"
    const cat = categories.find((c) => c.id === currentFilter)
    return cat ? cat.label : "Acervo"
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "md:w-20" : "md:w-72"} w-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 z-40 h-auto md:h-screen`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">Sistematiza</h1>
                <p className="text-xs text-muted-foreground">Gestão Intelectual</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-custom">
          <Button
            variant={currentFilter === "all" ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-11"
            onClick={() => setCurrentFilter("all")}
          >
            <LayoutGrid className="w-5 h-5" />
            {!sidebarCollapsed && <span>Geral</span>}
          </Button>

          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={currentFilter === cat.id ? "default" : "ghost"}
              className="w-full justify-start gap-3 h-11"
              onClick={() => setCurrentFilter(cat.id)}
            >
              <cat.icon className="w-5 h-5" />
              {!sidebarCollapsed && <span>{cat.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Actions */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-xs h-9 bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Importar (.json)</span>
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" accept=".json" onChange={importData} />

            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-xs h-9 bg-transparent"
              onClick={exportFullBackup}
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Exportar Tudo</span>
            </Button>
          </div>
        )}

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-6 border-t border-sidebar-border bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Desenvolvido para educação por{" "}
                  <span className="font-semibold text-foreground">Professor Sérgio Araújo</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">© 2025</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">{getViewTitle()}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredNotes.length} {filteredNotes.length === 1 ? "registro" : "registros"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>

                <Dialog open={isStyleModalOpen} onOpenChange={setIsStyleModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-11 w-11 bg-transparent">
                      <ScrollText className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Parâmetros de Estilo</DialogTitle>
                      <DialogDescription>
                        Defina a "voz" padrão para suas produções e orientações de IA.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      value={styleGuide}
                      onChange={(e) => setStyleGuide(e.target.value)}
                      rows={10}
                      placeholder="Ex: Tom formal, uso de citações diretas, linguagem acadêmica..."
                      className="resize-none"
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsStyleModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={saveStyle}>Salvar Estilo</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 h-11 px-6">
                      <Plus className="w-5 h-5" />
                      <span>Novo</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Processar Registro</DialogTitle>
                      <DialogDescription>Adicione um novo registro ao seu acervo intelectual.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={8}
                        placeholder="O que deseja arquivar?"
                        className="resize-none"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <span className="flex items-center gap-2">
                                  <span>{cat.emoji}</span>
                                  <span>{cat.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                            <SelectItem value="🗃️ Fontes">
                              <span className="flex items-center gap-2">
                                <span>🗃️</span>
                                <span>Fontes / Referências</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Tags (separadas por vírgula)"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={saveNote}>Arquivar Registro</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-custom">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? "Nenhum resultado encontrado" : "Nenhum registro ainda"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery
                    ? "Tente ajustar sua busca ou filtros."
                    : 'Comece arquivando seu primeiro registro clicando no botão "Novo" acima.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50"
                  >
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {note.category}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => exportMD(note.id)}>
                              <Download className="w-4 h-4 mr-2" />
                              Exportar MD
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteNote(note.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-foreground/90 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                        {note.content}
                      </p>

                      {/* Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {note.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs font-normal">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">{note.date}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
