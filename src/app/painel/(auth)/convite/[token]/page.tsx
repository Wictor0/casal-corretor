import FormAuth from '../../FormAuth';
import { definirSenha } from '../../actions';

export const dynamic = 'force-dynamic';
export default async function Convite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <FormAuth acao={definirSenha} token={token} titulo="Crie sua senha" subtitulo="Mínimo de 8 caracteres. Depois é só entrar com seu e-mail." botao="Salvar e entrar"
    campos={[{ name: 'senha', label: 'Nova senha', type: 'password', auto: 'new-password' }, { name: 'confirmar', label: 'Repita a senha', type: 'password', auto: 'new-password' }]} />;
}
