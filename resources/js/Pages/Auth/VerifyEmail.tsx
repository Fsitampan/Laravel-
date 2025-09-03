import GuestLayout from '@/layouts/GuestLayout';
import PrimaryButton from '@/components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BPSLogo } from '@/components/BPSLogo';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-2xl border-0">
                    <CardHeader className="text-center space-y-6 pb-8">
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Mail className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl text-foreground">
                                Verifikasi Email
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-2">
                                Kami telah mengirim link verifikasi ke email Anda. 
                                Silakan cek email dan klik link untuk melanjutkan.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {status === 'verification-link-sent' && (
                            <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                                Link verifikasi baru telah dikirim ke alamat email yang Anda daftarkan.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <PrimaryButton className="w-full justify-center" disabled={processing}>
                                {processing ? 'Mengirim...' : 'Kirim Ulang Link Verifikasi'}
                            </PrimaryButton>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 underline"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Keluar
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