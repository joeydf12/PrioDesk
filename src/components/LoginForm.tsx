import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'slack' | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Account aangemaakt!",
          description: "Je kunt nu inloggen met je gegevens.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Google Login Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleSlackLogin = async () => {
    setOauthLoading('slack');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'slack',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Slack Login Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src="../images/logopriodesk.png" alt="Priodesk Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent ml-3">
            Priodesk
          </h1>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={oauthLoading === 'google'}
            aria-label="Inloggen met Google"
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 font-semibold shadow-sm"
          >
            <span className="text-lg" role="img" aria-label="Google">🔵</span>
            {oauthLoading === 'google' ? 'Bezig met Google...' : 'Inloggen met Google'}
          </Button>
          <Button
            type="button"
            onClick={handleSlackLogin}
            disabled={oauthLoading === 'slack'}
            aria-label="Inloggen met Slack"
            className="w-full bg-[#4A154B] text-white hover:bg-[#4A154B]/90 flex items-center justify-center gap-2 font-semibold shadow-sm"
          >
            <span className="text-lg" role="img" aria-label="Slack">💬</span>
            {oauthLoading === 'slack' ? 'Bezig met Slack...' : 'Inloggen met Slack'}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 font-medium">of</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wachtwoord
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#263456] hover:bg-[#263456]/90 text-white font-bold shadow-sm"
          >
            {loading ? 'Bezig...' : isLogin ? 'Inloggen' : 'Registreren'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 font-medium focus:underline"
          >
            {isLogin ? 'Nog geen account? Registreer hier' : 'Al een account? Log hier in'}
          </button>
        </div>
      </div>
    </div>
  );
};
