
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/components/permissions-provider';
import type { User, UserRole } from '@/components/permissions-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/user-actions';
import { uploadImage } from '@/lib/storage-actions';
import { Loader2, KeyRound, User as UserIcon, Image as ImageIcon, Edit3, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { app } from '@/lib/firebase';

const profileSchema = z.object({
    displayName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, { message: "A senha atual é obrigatória." }),
    newPassword: z.string().min(6, { message: "A nova senha deve ter pelo menos 6 caracteres." }),
    confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmNewPassword"],
});


type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const MAX_IMAGE_WIDTH = 512;
const IMAGE_QUALITY = 0.8;

const resizeAndCompressImage = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new Error('Não foi possível obter o contexto do canvas.'));
                }

                let { width, height } = img;
                if (width > MAX_IMAGE_WIDTH) {
                    height = (height * MAX_IMAGE_WIDTH) / width;
                    width = MAX_IMAGE_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};


const roleLabels: Record<UserRole, string> = {
  developer: 'Desenvolvedor',
  manager: 'Gerente',
  project_manager: 'Gerente de Projeto',
  supervisor_1: 'Supervisor 1',
  supervisor_2: 'Supervisor 2',
  technician_1: 'Técnico 1',
  technician_2: 'Técnico 2',
  guest: 'Convidado',
};

const roleStyles: Record<UserRole, string> = {
  developer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manager: "bg-red-500/20 text-red-400 border-red-500/30",
  project_manager: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  supervisor_1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  supervisor_2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  technician_1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  technician_2: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  guest: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};


export default function ProfilePage() {
    const { user: initialUser, isDeveloper } = usePermissions();
    const { toast } = useToast();
    const router = useRouter();
    
    // O estado local do usuário permite atualizações instantâneas da UI
    const [user, setUser] = React.useState<User | null>(initialUser);
    
    const photoInputRef = React.useRef<HTMLInputElement>(null);
    const signatureInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState<'photo' | 'signature' | null>(null);

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { displayName: user?.displayName || "" },
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
    });
    
    React.useEffect(() => {
        if(initialUser) {
            setUser(initialUser);
            profileForm.reset({ displayName: initialUser.displayName || "" });
        }
    }, [initialUser, profileForm]);

    const handleProfileSubmit = async (data: ProfileFormData) => {
        if (!user) return;
        try {
            await updateUser({ id: user.id, displayName: data.displayName });
            toast({ title: "Sucesso!", description: "Seu nome foi atualizado." });
             // Atualiza o estado local e dispara a revalidação dos dados do servidor
            setUser(prev => prev ? { ...prev, displayName: data.displayName } : null);
            router.refresh();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        }
    };
    
    const handleFileUpload = async (file: File, type: 'photo' | 'signature') => {
        if (!user) return;
        setIsUploading(type);
        try {
            const compressedDataURI = await resizeAndCompressImage(file);
            if (!compressedDataURI) throw new Error("Não foi possível otimizar a imagem.");

            const blobName = `${type}-${user.id}.jpg`;
            const url = await uploadImage(compressedDataURI, blobName);

            const updateData = type === 'photo' ? { photoURL: url } : { signatureUrl: url };
            
            await updateUser({ id: user.id, ...updateData });

            setUser(prev => prev ? { ...prev, ...updateData } : null);
            toast({ title: "Sucesso!", description: `Sua ${type === 'photo' ? 'foto' : 'assinatura'} foi atualizada.` });
            router.refresh(); 
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro de Upload', description: error.message });
            setUser(initialUser); 
        } finally {
            setIsUploading(null);
        }
    };

    const onSubmitPassword = async (data: PasswordFormData) => {
        const auth = getAuth(app);
        const currentUser = auth.currentUser;

        if (!currentUser || !currentUser.email) {
            toast({ variant: 'destructive', title: 'Erro de autenticação', description: "Usuário não está logado ou não tem um e-mail associado." });
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, data.newPassword);

            toast({ title: "Sucesso!", description: "Sua senha foi alterada." });
            passwordForm.reset();
        } catch (error: any) {
            let description = "Ocorreu um erro ao tentar atualizar a senha.";
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "A senha atual está incorreta.";
            } else if (error.code === 'auth/requires-recent-login') {
                description = "Esta operação é sensível e requer um login recente. Por favor, faça logout e login novamente.";
            }
            toast({ variant: 'destructive', title: 'Erro ao alterar senha', description });
        }
    };

    if (!user) {
        return (
             <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Meu Perfil</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Foto, Informações e Assinatura */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card>
                        <CardHeader className="items-center">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary">
                                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                                    <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <Button size="icon" variant="outline" className="absolute bottom-2 right-2 rounded-full h-9 w-9 group-hover:bg-primary group-hover:text-primary-foreground transition-all" onClick={() => photoInputRef.current?.click()} disabled={!!isUploading}>
                                    {isUploading === 'photo' ? <Loader2 className="h-5 w-5 animate-spin"/> : <ImageIcon className="h-5 w-5"/>}
                                </Button>
                                <input type="file" ref={photoInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'photo')} />
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                             <div className="flex items-center justify-center gap-2">
                                <h2 className="text-2xl font-semibold font-headline">{user.displayName}</h2>
                                <Badge variant="outline" className={cn("capitalize", roleStyles[user.role])}>
                                    {roleLabels[user.role]}
                                </Badge>
                             </div>
                             <p className="text-sm text-muted-foreground">{user.email}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assinatura Digital</CardTitle>
                             <CardDescription>Para futuros relatórios e documentos.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50 p-2">
                               {user.signatureUrl ? (
                                    <img src={user.signatureUrl} alt="Assinatura" className="max-h-full max-w-full object-contain" />
                               ) : (
                                    <span className="text-sm text-muted-foreground">Nenhuma assinatura</span>
                               )}
                            </div>
                             <Button variant="outline" onClick={() => signatureInputRef.current?.click()} disabled={!!isUploading}>
                                {isUploading === 'signature' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Edit3 className="mr-2 h-4 w-4"/>}
                                {user.signatureUrl ? 'Alterar Assinatura' : 'Carregar Assinatura'}
                            </Button>
                            <input type="file" ref={signatureInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'signature')} />
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Direita: Formulários de Edição */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                         <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5"/> Informações Pessoais</CardTitle>
                                    <CardDescription>Edite seu nome de exibição.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <FormField
                                        control={profileForm.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome Completo</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                        {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar Nome
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>

                    <Card>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
                                 <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Segurança</CardTitle>
                                    <CardDescription>Altere sua senha de acesso. A alteração de senha só é permitida para contas criadas via Email/Senha.</CardDescription>
                                 </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Senha Atual</FormLabel>
                                                <FormControl><Input type="password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nova Senha</FormLabel>
                                                <FormControl><Input type="password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="confirmNewPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmar Nova Senha</FormLabel>
                                                <FormControl><Input type="password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                        {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Alterar Senha
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
