
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTransition } from "react";
import Link from "next/link";
import Router, { useRouter } from 'next/router';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, IterationCw, ListFilter, Loader2 } from "lucide-react";
import { DialogLevita } from "@/components/dialog-levita";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ModalLevita from "@/components/modal";
import PageHeader from "@/components/pgtitle";
import { Input } from "@/components/ui/input";
import { UUID } from "crypto";
import { Levita } from "@/components/apiObjects";

export async function fetchLevitas() {
  var levita = await (fetch('http://localhost:1004/v1/levita'));
  if (!levita.ok)
    throw new Error(`HTTP error! status: ${levita.status}`);
  var data: Levita[] = await levita.json() as Levita[];
  return data as Levita[];
}

export default async function Home() {

  var levitas = await fetchLevitas();

  return (
    <main className="max-w-6xl mx-auto my-12">
      <PageHeader urlBack="/v0" title="Levitas" subtitle="Visualização dos Levitas" />

      <div className="flex w-full items-center space-x-2">
        <ListFilter
          className="w-auto text-4xl justify-center size-9 p-1 cursor-pointer outline outline-1 outline-rose-400/25 hover:bg-rose-400 hover:text-black rounded-md
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
        <Input className="flex" type="search" placeholder="Procure por um Levita" />
        <Button type="submit" className="">Buscar</Button>
      </div>
      <br />

      <div className="grid grid-cols-4 gap-8">
        {levitas.map(levita => (
          <Card key={levita.id}>
            <CardHeader>
              <CardTitle className="flex">{levita.nome}
              </CardTitle>
              <CardDescription>
                {levita.email ? levita.email : levita.contato}
              </CardDescription>
            </CardHeader>
            <CardContent key={levita.id} className="h-28">
              {levita.instrumentos.map(instrumento => (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold 
                transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 m-1">{instrumento.nome.toUpperCase()}</div>))}
            </CardContent>
            <CardFooter className="flex justify-stretch">
              <DialogLevita levita={levita} key={levita.id}/>
              {/* <BadgeDisponivel disp={levita.disponivel} chav={levita.id.toString()} /> */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );

}

interface bdprops {
  disp: boolean,
  chav: string
}

export function BadgeDisponivel(bdprops: bdprops) {
  return (
    <div className="flex items-center inset-y-0 right-0 self-end space-x-2 mx-2">
      <Badge key={bdprops.chav} className={bdprops.disp ? "bg-rose-400 space-x-2" : "space-x-2"} variant={bdprops.disp ? "default" : "outline"}>
        {bdprops.disp ? <p>Disponível</p> : <p>Ocupado</p>}
      </Badge>
    </div>
  )

}