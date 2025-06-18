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
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('nl');
    const [dataCollection, setDataCollection] = useState(true);
    const [usageAnalytics, setUsageAnalytics] = useState(true);

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

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Dark Mode</Label>
                                    <p className="text-sm text-slate-500">Schakel tussen licht en donker thema</p>
                                </div>
                                <Switch
                                    checked={darkMode}
                                    onCheckedChange={setDarkMode}
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

                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-4">Privacy</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Data verzameling</Label>
                                            <p className="text-sm text-slate-500">Verzamel anonieme gebruiksgegevens</p>
                                        </div>
                                        <Switch
                                            checked={dataCollection}
                                            onCheckedChange={setDataCollection}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Gebruiksanalyse</Label>
                                            <p className="text-sm text-slate-500">Help ons de app te verbeteren</p>
                                        </div>
                                        <Switch
                                            checked={usageAnalytics}
                                            onCheckedChange={setUsageAnalytics}
                                        />
                                    </div>
                                </div>
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