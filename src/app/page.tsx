
import { redirect } from 'next/navigation';

// Esta página agora é um Server Component.
// Sua única responsabilidade é redirecionar o usuário da rota raiz ("/")
// para a central de evidências ("/evidence"), que é a nova página principal.
export default function HomePage() {
  redirect('/evidence');
}
