
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BankIcon from './BankIcon';
import { User, Lock, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onLogin, onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <Card className="w-full max-w-md glass-effect dark:glass-effect-dark animate-fade-in shadow-2xl border-0">
      <CardHeader className="text-center space-y-6 pb-8">
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-banking rounded-full blur-lg opacity-30 animate-pulse-slow"></div>
          <BankIcon className="w-20 h-20 animate-float relative z-10" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-banking bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-bank-blue-500" />
            Gurú
          </CardTitle>
          <p className="text-lg font-medium text-bank-blue-600 dark:text-bank-blue-400">
            Asistente Bancario AI
          </p>
          <p className="text-sm text-muted-foreground">
            Tu experto financiero inteligente te espera
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Correo Electrónico</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-bank-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 focus:border-bank-blue-500 focus:ring-4 focus:ring-bank-blue-500/20 focus:bg-white dark:focus:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-bank-blue-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 focus:border-bank-blue-500 focus:ring-4 focus:ring-bank-blue-500/20 focus:bg-white dark:focus:bg-gray-800"
                  required
                />
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-banking hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-xl font-semibold text-base shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Conectar con Gurú
          </Button>
          
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              ¿Primera vez con Gurú?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-bank-blue-600 hover:text-bank-blue-800 dark:text-bank-blue-400 dark:hover:text-bank-blue-300 font-semibold transition-colors duration-300 hover:underline"
              >
                Crear cuenta nueva
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
