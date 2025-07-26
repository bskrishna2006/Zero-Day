import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Key, Mail, ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      // Only keep the rejection check for prototype
      if (error.message?.includes('verification was rejected')) {
        toast({
          title: "Verification Rejected",
          description: "Your account verification was rejected. Please contact the administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden font-['Inter',sans-serif]">
      {/* Left side - Animated Background */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#6a11cb] to-[#2575fc] p-12 relative"
      >
        <div className="absolute inset-0 bg-[url('/patterns/edu-pattern.svg')] opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/patterns/education-illustration.svg" alt="Education Illustration" className="w-[90%] max-w-[500px] opacity-75 floating-illustration" />
        </div>
        
        <div className="h-full flex flex-col justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-10 w-10 text-white" />
            <h1 className="text-3xl font-bold text-white">CampusLink</h1>
          </div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white leading-tight">Transform Your Campus Experience</h2>
              <p className="text-white/80 mt-4 text-lg max-w-md">
                Connect with peers, exchange skills, and access everything you need in one unified platform.
              </p>
            </motion.div>
            
            <div className="flex flex-col space-y-4">
              {[
                "Access campus resources and announcements",
                "Connect with skilled peer teachers",
                "Get real-time notifications for lost & found items",
                "Streamline your student experience"
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
                >
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <p className="text-white/90">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-white/60">
            © 2025 CampusLink. All rights reserved.
          </p>
        </div>
      </motion.div>
      
      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-12 bg-background/95 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl bg-[rgba(255,255,255,0.15)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.25)] rounded-[20px] overflow-hidden glass-card">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="rounded-full bg-[rgba(255,255,255,0.25)] p-4 shadow-lg">
                  <GraduationCap className="h-9 w-9 text-primary" />
                </div>
                <CardTitle className="text-2xl font-[600] tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-center text-sm md:text-base">
                  Sign in to your account to continue your campus journey
                </CardDescription>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="email" className="text-sm font-[600] block mb-2">
                      Email
                    </Label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="pl-12 h-12 font-[400] bg-[#e0e0e0] rounded-[12px] border-none 
                                  shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] 
                                  focus-visible:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(59,130,246,0.3)]
                                  hover:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff,0_0_8px_rgba(59,130,246,0.3)]
                                  transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="password" className="text-sm font-[600]">
                        Password
                      </Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative flex items-center">
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="pl-12 pr-12 h-12 font-[400] bg-[#e0e0e0] rounded-[12px] border-none 
                                  shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] 
                                  focus-visible:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(59,130,246,0.3)]
                                  hover:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff,0_0_8px_rgba(59,130,246,0.3)]
                                  transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 stroke-[1.5]" />
                        ) : (
                          <Eye className="h-5 w-5 stroke-[1.5]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-[600] bg-[#3b82f6] rounded-[12px] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] 
                            hover:bg-[#2563eb] hover:transform hover:scale-[1.02] hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] 
                            focus:shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff]
                            transition-all duration-300 btn-ripple"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </form>
            
            <div className="px-6 pb-8 pt-2">
              <div className="relative my-5">
                <Separator className="opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-[rgba(255,255,255,0.3)] backdrop-blur-[8px] px-4 py-1 rounded-full text-xs font-[600] text-muted-foreground shadow-sm">OR</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4 font-[400]">
                  Don't have an account yet?
                </p>
                <Link to="/signup" className="inline-block w-full">
                  <Button 
                    variant="outline" 
                    className="w-full h-11 font-[500] border-primary/20 bg-[#e0e0e0] rounded-[12px]
                              shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]
                              hover:bg-white/90 hover:transform hover:scale-[1.02] 
                              hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
                              transition-all duration-300 btn-ripple"
                  >
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}