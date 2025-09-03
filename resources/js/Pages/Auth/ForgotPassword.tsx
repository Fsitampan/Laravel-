import GuestLayout from '@/layouts/GuestLayout';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BPSLogo } from '@/components/BPSLogo';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-2xl border-0">
                    <CardHeader className="text-center space-y-6 pb-8">
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <BPSLogo className="text-white" size="lg" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl text-foreground">
                                Lupa Password?
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-2">
                                Masukkan email Anda untuk mendapatkan link reset password
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <PrimaryButton className="w-full justify-center" disabled={processing}>
                                {processing ? 'Mengirim...' : 'Kirim Link Reset Password'}
                            </PrimaryButton>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 underline"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Login
                            </Link>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                © 2024 BPS Provinsi Riau
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}