
import { redirect } from 'next/navigation';

// Esta página agora atua como um redirecionamento para a nova página /login1
// para contornar problemas persistentes de cache.
export default function LoginPage() {
  redirect('/login1');
}
