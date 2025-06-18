import React from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const Account = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header onCreateTask={() => { }} />

            <main className="container mx-auto px-4 py-8 pb-24">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            className="mb-4"
                            onClick={() => navigate('/profile')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Terug naar profiel
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Account</h1>
                        <p className="text-slate-600">Beheer je account gegevens</p>
                    </div>

                    <Card>
                        <CardContent className="space-y-6 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mailadres</Label>
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        value={user?.email || ''}
                                        className="bg-slate-50"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Voer nieuw wachtwoord in"
                                    className="bg-slate-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Bevestig nieuw wachtwoord"
                                    className="bg-slate-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="created">Account aangemaakt op</Label>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <Input
                                        id="created"
                                        value={user?.created_at ? new Date(user.created_at).toLocaleDateString('nl-NL') : ''}
                                        disabled
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button
                                    variant="default"
                                    className="bg-[#263456] hover:bg-[#263456]/90 text-white"
                                >
                                    Wijzigingen opslaan
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Uitloggen
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <MobileNav />
        </div>
    );
};

export default Account; 