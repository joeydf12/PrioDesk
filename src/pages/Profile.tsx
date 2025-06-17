import React from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Calendar, Check, X, ArrowLeft, Diamond } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const plans = [
    {
      name: 'Gratis',


      isNew: true,
      features: [
        'Prioriteiten stellen',
        'Zelf taken herplannen',

      ],
    },
    {
      name: 'Premium ',
      price: '5,99',

      isNew: false,
      features: [
        'Prioriteiten stellen',
        'Met behulp van AI herplannen',
        'Bijlagen samenvatten en analyseren met AI',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => { }} />

      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
              <User className="w-8 h-8 mr-3 text-blue-600" />
              Profiel
            </h1>
            <p className="text-slate-600">Beheer je account instellingen</p>
          </div>

          {/* Premium blok met knop en preview */}
          <div className="mb-8 w-full">
            <Dialog>
              <DialogTrigger asChild>
                <button className="group w-full focus:outline-none">
                  <Card className="w-full bg-gradient-to-br from-white to-[#f3f7fa] shadow-lg transition-all duration-200 group-hover:shadow-2xl group-hover:scale-[1.02] border-0 p-0">
                    <div className="flex flex-col items-center gap-6 p-8">
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl sm:text-2xl font-bold text-[#253253]">✨ Premium functies</span>
                          <Badge variant="outline" className="bg-[#19c2f3] text-[#253253] border-[#19c2f3] text-xs px-2 py-1">Nieuw</Badge>
                        </div>
                        <div className="w-full rounded-lg bg-[#f3f7fa] p-4 flex flex-col gap-2 shadow-sm">
                          <div className="font-semibold text-[#253253] text-base mb-1 flex items-center gap-2">
                            <span>🚀 Premium preview</span>
                          </div>
                          <ul className="list-disc list-inside text-[#253253] text-sm pl-2 text-left">
                            <li>AI-integratie met je agenda</li>
                            <li>AI-samenvattingen van bijlagen</li>
                            <li>En meer slimme tools voor productiviteit!</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </button>
              </DialogTrigger>
              <DialogContent className="fixed inset-0 w-screen h-screen p-0 bg-[#73956F] border-none shadow-xl z-50 flex items-center justify-center !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-full !rounded-none">
                <DialogTitle className="sr-only">Abonnement</DialogTitle>
                <div className="w-full sm:max-w-5xl lg:max-w-7xl py-8 px-4 sm:p-12 overflow-y-auto max-h-[90vh] relative flex flex-col items-center justify-start">
                  <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                  </DialogClose>

                  <div className="flex flex-col items-center text-center mt-8 mb-4">
                    <img src="/src/images/logopriodesk.png" alt="Priodesk Logo" className="w-32 h-32 object-contain" />
                    <h2 className="text-2xl font-semibold mt-4 text-white">Abonnement</h2>

                  </div>

                  <div className="w-full px-4 sm:px-0 sm:max-w-lg mx-auto flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    {plans.map((plan) => (
                      <Card key={plan.name} className="w-full sm:flex-1 rounded-xl p-6 relative bg-[#00a896]/[0.2] border border-white/[0.3] shadow-none">
                        {plan.isNew && (
                          <Badge className="absolute -top-2 -left-2 bg-[#263456] text-white rotate-[-10deg] font-bold px-3 py-1 rounded-md text-xs">Huidig</Badge>
                        )}
                        <div className="flex items-baseline justify-between mb-2">
                          <h3 className="text-lg font-bold text-white flex items-center">
                            {plan.name}
                            {plan.name === 'Premium' && <Check className="w-5 h-5 text-white ml-2" />}
                          </h3>
                          {plan.price && <p className="text-3xl font-bold text-white">{plan.price}</p>}
                        </div>
                        <ul className="mt-4 space-y-2 text-white">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-white" /> {feature}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>

                  <Button variant="default" className="w-full max-w-xs bg-[#263456] hover:bg-[#263456]/90 text-white font-bold py-3 rounded-full shadow-lg mb-4">
                    Neem Premium abbonement
                  </Button>

                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Informatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
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

              <div className="pt-4">
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full sm:w-auto"
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

export default Profile;