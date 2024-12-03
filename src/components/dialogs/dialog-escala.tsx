"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Escala, Levita, convertDateFormat } from "../apiObjects";
import { Button } from "../ui/button";
import { CirclePlus, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { UUID } from "crypto";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";

interface props {
    escalaId: UUID
}

export function DialogVerEscala(props: props) {
    const [escalaData, setEscalaData] = useState<Escala>()
    const [isLoading, setIsLoading] = useState(true)
    const [backs, setBacks] = useState<string>("")
    useEffect(() => {
        // setIsLoading(true)
        fetch(`http://localhost:1004/v1/escala/${props.escalaId}`)
            .then((res) => res.json())
            .then((data) => {
                setIsLoading(false)
                setEscalaData(data)
            })
            .catch((error) => {
                console.error("Erro na comunicação com a api: ", error)
                setEscalaData(undefined);
            })
    }, [])

    // const backs = escalaData?.back.map((back) => (back.nome)).join(", ")

    return (
        !isLoading && escalaData ?

            <Dialog>
                <DialogTrigger asChild key={escalaData.id} className="p-5">
                    <Button variant={"outline"} className="flex items-center justify-center">Ver Escala</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className={"text-2xl " + (escalaData.domingo ? "text-teal-400/80" :
                            escalaData.quarta ? "text-emerald-400/80" : "text-sky-400/80"
                        )}>{escalaData.titulo}</DialogTitle>
                        <DialogDescription className="border-b border-zinc-600">
                            {convertDateFormat(escalaData.data)}
                        </DialogDescription>
                        <br />
                        <p className="text-teal-400">Ministro: <a className="text-emerald-400">{escalaData.ministro.nome}</a></p>
                        <p className="text-teal-400">Violão: {escalaData.violao ? <a className="text-white"> {escalaData.violao.nome}</a> : <a className="text-zinc-50/50">Não inserido.</a>}</p>
                        <p className="text-teal-400">Teclado: {escalaData.teclado ? <a className="text-white"> {escalaData.teclado.nome}</a> : <a className="text-zinc-50/50">Não inserido.</a>}</p>
                        <p className="text-teal-400">Bateria: {escalaData.bateria ? <a className="text-white"> {escalaData.bateria.nome}</a> : <a className="text-zinc-50/50">Não inserido.</a>}</p>
                        <p className="text-teal-400">Baixo: {escalaData.baixo ? <a className="text-white"> {escalaData.baixo.nome}</a> : <a className="text-zinc-50/50">Não inserido.</a>}</p>
                        <p className="text-teal-400">Guitarra: {escalaData.guitarra ? <a className="text-white"> {escalaData.guitarra.nome}</a> : <a className="text-zinc-50/50">Não inserido.</a>}</p>
                        <p className="text-teal-400">Backs: {escalaData.back.length > 0 ? <a className="text-white"> {
                            escalaData.back.map((back) => (back.nome)).join(", ")}.</a> : <a className="text-zinc-50/50">Não inseridos.</a>}</p>
                        <br />

                    </DialogHeader>
                    <Label>Observações:</Label>
                    {escalaData.observacoes ? <p className="text-zinc-200">{escalaData.observacoes}</p> : <p className="text-foreground/25">Nenhuma observação.</p>}
                    <br />

                    <Label>Músicas:</Label>
                    <Card className="bg-transparent grid-flow-row p-2">
                        {escalaData.musicas ?
                            escalaData.musicas.map((musica) => (
                                <Button key={musica.id} variant={"outline"} className="p-2 rounded-lg m-2">{musica.nome}</Button>
                            )) : <p className="text-foreground/25">Nenhuma música inserida.</p>}
                    </Card>
                    <DialogFooter>
                        <DialogAddEditEscala isEdit={true} escala={escalaData} />
                    </DialogFooter>
                </DialogContent>
            </Dialog> : <Button variant={"outline"} disabled={true} className="flex items-center justify-center">Ver Escala</Button>
    )
}

export function listBacks(backs: Levita[]) {
    const backNames = new Array<string>();
    backs.forEach((back) => {
        backNames.push(back.nome)
    })

    return String(backNames.join(", "))
}

interface addEditDialogProps {
    isEdit: boolean,
    escala: Escala | null
}

export function DialogAddEditEscala(pp: addEditDialogProps) {
    const [escala, setEscala] = useState<Escala>()
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingLevitas, setIsLoadingLevitas] = useState(true);
    const [levitasDisponiveis, setLevitasDisponiveis] = useState<Levita[]>([])
    const [data, setData] = useState("");
    const [titulo, setTitulo] = useState("");
    const [ministro, setMinistro] = useState("");
    const [baixo, setBaixo] = useState("");
    const [bateria, setBateria] = useState("");
    const [guitarra, setGuitarra] = useState("");
    const [teclado, setTeclado] = useState("");
    const [violao, setViolao] = useState("");
    const [backs, setBacks] = useState<String[]>([]);
    const [observacao, setObservacao] = useState("");

    function filterByInstrumento(instrumentoId: number) {
        return levitasDisponiveis.filter((levita) => levita.instrumentos.some((instrumento) => instrumento.id == instrumentoId))
    }

    useEffect(() => {
        fetch("http://localhost:1004/v1/levita/resumed")
            .then((res) => res.json()).then((data) => {
                setIsLoadingLevitas(false)
                setLevitasDisponiveis(data)
            }).catch((error) => {
                console.error("Erro na comunicação com a api: ", error)
                setLevitasDisponiveis([])
            })
    })
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {pp.isEdit ? <Button><PencilLine />Editar Escala</Button>
                    : <Button variant={"outline"} className="mx-2 hover:text-emerald-500">
                        <CirclePlus className="mx-1 text-emerald-500" />Criar Escala</Button>
                }
            </DialogTrigger>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>{pp.isEdit ? "Editando uma Escala" : "Criando uma Escala"}</DialogTitle>
                    <DialogDescription>
                        {pp.isEdit ? `Editando a escala ${pp.escala?.titulo}` : "Adicione uma nova escala ao planejador."}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[47dvh]">
                    <Label>Título:</Label>
                    <Input type="text" placeholder="Insira um título para a Escala."
                        value={pp.escala?.titulo} onChange={(e) => setTitulo(e.target.value)} />
                    <Label>Data:</Label>
                    <Input type="date" placeholder="Data."
                        value={pp.escala?.data.toString()} onChange={(e) => setData(e.target.value)} />
                    <br />

                    <Label>Ministro</Label>
                    <Select onValueChange={(value) => setMinistro(value)} disabled={isLoadingLevitas || pp.escala?.data.toString().length == 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um ministro." />
                        </SelectTrigger>
                        <SelectContent>
                            {levitasDisponiveis.map((levita) => (
                                <SelectItem value={levita.id} key={levita.id} onSelect={() => setMinistro(levita.nome)}>{pp.escala?.ministro.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <br />

                    <Label>Violão</Label>
                    <Select onValueChange={(value) => setViolao(value)} disabled={isLoadingLevitas || pp.escala?.data.toString().length == 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Escolha um levita para tocar violão." />
                        </SelectTrigger>
                        <SelectContent>
                            {filterByInstrumento(1).map((levita) => (
                                <SelectItem value={levita.id} key={levita.id} onSelect={() => setViolao(levita.id)}>{pp.escala?.violao.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <br />

                    <Label>Teclado</Label>
                    <Select onValueChange={(value) => setTeclado(value)} disabled={isLoadingLevitas || pp.escala?.data.toString().length == 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Escolha um levita para tocar teclado." />
                        </SelectTrigger>
                        <SelectContent>
                            {filterByInstrumento(2).map((levita) => (
                                <SelectItem value={levita.id} key={levita.id} onSelect={() => setTeclado(levita.id)}>{pp.escala?.teclado.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <br />

                    <Label>Bateria</Label>
                    <Select onValueChange={(value) => setBateria(value)} disabled={isLoadingLevitas || pp.escala?.data.toString().length == 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Escolha um levita para tocar bateria." />
                        </SelectTrigger>
                        <SelectContent>
                            {filterByInstrumento(3).map((levita) => (
                                <SelectItem value={levita.id} key={levita.id} onSelect={() => setBateria(levita.id)}>{pp.escala?.bateria.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <br />

                    <Label>Baixo</Label>
                    <Select onValueChange={(value) => setBaixo(value)} disabled={isLoadingLevitas || pp.escala?.data.toString().length == 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Escolha um levita para tocar baixo." />
                        </SelectTrigger>
                        <SelectContent>
                            {filterByInstrumento(4).map((levita) => (
                                <SelectItem value={levita.id} key={levita.id} onSelect={() => setBaixo(levita.id)}>{pp.escala?.baixo.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <br />

                    <Label>Guitarra</Label>
                    <Select onValueChange={(value) => setGuitarra(value)} disabled={isLoadingLevitas || pp.escala?.data.toString().length == 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Escolha um levita para tocar guitarra." />
                        </SelectTrigger>
                        <SelectContent>
                            {filterByInstrumento(5).map((levita) => (
                                <SelectItem value={levita.id} key={levita.id} onSelect={() => setGuitarra(levita.id)}>{pp.escala?.guitarra.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <br />

                    <Label>Observação:</Label>
                    <Textarea placeholder="Insira uma observação. (Ex: Dia e hora de ensaio, local de apresentação, etc.)"
                        value={pp.escala?.observacoes} onChange={(e) => setObservacao(e.target.value)} />
                    <br />

                    <Label>Backs:</Label>
                    <Card className="bg-transparent grid grid-cols-4">
                        {filterByInstrumento(0).map((levita) => (
                            <Button key={levita.id} variant={"outline"} type="submit" className="p-2 rounded-lg m-2"
                                onClick={() => setBacks([...backs, levita.nome])}>{levita.nome}</Button>
                        ))}
                    </Card>
                    <br />

                </ScrollArea>
                <DialogFooter>
                    <Button className="hover:bg-emerald-500" onClick={() => {
                        setIsLoading(true)
                        pp.isEdit ?
                            fetch("http://localhost:1004/v1/escala", {
                                method: "PUT",
                                body: JSON.stringify({
                                    id: escala?.id,
                                    titulo: escala?.titulo,
                                    data: escala?.data,
                                    ministro: escala?.ministro,
                                    violao: escala?.violao,
                                    teclado: escala?.teclado,
                                    bateria: escala?.bateria,
                                    baixo: escala?.baixo,
                                    guitarra: escala?.guitarra,
                                    back: escala?.back,
                                    observacoes: escala?.observacoes
                                })
                            }).then((response) => {
                                setIsLoading(false)
                                alert(response.status === 200 ? "Levita removido com sucesso!" : "Erro ao remover o Levita: " + response.headers.get("error"))
                            }).catch((error) => {
                                alert("Erro ao remover o Levita!")
                                console.error("Erro na comunicação com a api: ", error);
                            }) :
                            fetch("http://localhost:1004/v1/escala", {
                                method: "POST",
                                body: JSON.stringify({
                                    id: escala?.id,
                                    data: escala?.data,
                                    titulo: escala?.titulo,
                                    ministro: escala?.ministro,
                                    violao: escala?.violao,
                                    teclado: escala?.teclado,
                                    bateria: escala?.bateria,
                                    baixo: escala?.baixo,
                                    guitarra: escala?.guitarra,
                                    back: escala?.back,
                                    observacoes: escala?.observacoes
                                })
                            }).then((response) => {
                                setIsLoading(false)
                                alert(response.status === 200 ? "Levita removido com sucesso!" : "Erro ao remover o Levita: " + response.headers.get("error"))
                            }).catch((error) => {
                                alert("Erro ao remover o Levita!")
                                console.error("Erro na comunicação com a api: ", error);
                            })
                    }}>Adicionar</Button>
                    <Button className="hover:bg-rose-500" onClick={() => setOpen(false)}>Cancelar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}