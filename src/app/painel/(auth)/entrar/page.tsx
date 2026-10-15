import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/auth';
import FormAuth from '../FormAuth';
import { entrar } from '../actions';

export const dynamic = 'force-dynamic';
export default async function Entrar() {
  if (await usuarioAtual()) redirect('/painel');
  return <FormAuth acao={entrar} titulo="Painel administrativo" subtitulo="Acesso restrito a Sumaia e Allan" botao="Entrar"
    campos={[{ name: 'email', label: 'E-mail', type: 'email', auto: 'username' }, { name: 'senha', label: 'Senha', type: 'password', auto: 'current-password' }]} />;
}
