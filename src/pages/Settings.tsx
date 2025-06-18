import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState('nl');

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
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Instellingen</h1>
                        <p className="text-slate-600">Pas je voorkeuren aan</p>
                    </div>

                    <Card>
                        <CardContent className="space-y-6 p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Notificaties</Label>
                                    <p className="text-sm text-slate-500">Ontvang meldingen over nieuwe taken en updates</p>
                                </div>
                                <Switch
                                    checked={notifications}
                                    onCheckedChange={setNotifications}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-base">Taal</Label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-slate-50"
                                >
                                    <option value="nl">Nederlands</option>
                                    <option value="en">English</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <MobileNav />
        </div>
    );
};

export default Settings; 