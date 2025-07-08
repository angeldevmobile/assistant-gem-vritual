import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BankIcon from './BankIcon';
import { User, Lock, Mail, Phone } from 'lucide-react';

interface RegisterFormProps {
  onRegister: (name: string, email: string, phone: string, password: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onRegister, onSwitchToLogin }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    onRegister(name, email, phone, password);
  };

  return (
    <Card className="w-full max-w-md glass-effect dark:glass-effect-dark animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <BankIcon className="w-16 h-16 animate-float" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-banking bg-clip-text text-transparent">
          Crear Cuenta
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Únete al futuro de la banca digital
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-bank-blue-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-bank-blue-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-bank-blue-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-bank-blue-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-bank-blue-500"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-banking hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            Crear Cuenta
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-bank-blue-600 hover:text-bank-blue-800 font-medium transition-colors duration-300"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
