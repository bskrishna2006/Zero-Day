import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GraduationCap, User, Mail, Key, ArrowRight, Loader2, CheckCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const { signup, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle ID card file selection
  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "ID card image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, GIF, WebP)",
          variant: "destructive",
        });
        return;
      }
      
      setIdCard(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (role === 'student' && !idCard) {
      toast({
        title: "ID Card Required",
        description: "Please upload your college ID card for verification.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Submitting with ID card:', idCard);
      await signup(email, password, name, role, idCard);
      
      // For prototype: directly log in all users without verification
      toast({
        title: "Account created successfully!",
        description: "Welcome to CampusLink.",
      });
      
      // Redirect all users directly to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse overflow-hidden font-['Inter',sans-serif]">
      {/* Right side - Animated Background */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
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
              <h2 className="text-4xl font-bold text-white leading-tight">Begin Your Campus Journey</h2>
              <p className="text-white/80 mt-4 text-lg max-w-md">
                Join a community of students and educators working together to create an exceptional campus experience.
              </p>
            </motion.div>
            
            <div className="flex flex-col space-y-5">
              {[
                "Free access to all campus resources",
                "Connect with peer teachers and experts",
                "Personalized dashboard for your needs",
                "Seamless communication tools"
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
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
      
      {/* Left side - Signup Form */}
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
                <CardTitle className="text-2xl font-[600] tracking-tight">Create Your Account</CardTitle>
                <CardDescription className="text-center text-sm md:text-base">
                  Join CampusLink to access all campus services
                </CardDescription>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="name" className="text-sm font-[600] block mb-2">
                      Full Name
                    </Label>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
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
                    <Label htmlFor="email" className="text-sm font-[600] block mb-2">
                      Email Address
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
                    <Label htmlFor="password" className="text-sm font-[600] block mb-2">
                      Password
                    </Label>
                    <div className="relative flex items-center">
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Must be at least 8 characters long
                    </p>
                  </div>
                  
                  <div className="space-y-2 pt-1">
                    <Label className="text-sm font-[600] block mb-2">Account Type</Label>
                    <RadioGroup 
                      value={role} 
                      onValueChange={(value: 'student' | 'admin') => setRole(value)}
                      className="bg-[#e0e0e0] p-2 rounded-[12px] grid grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="student"
                        className={`flex items-center justify-center space-x-2 rounded-[10px] p-3 cursor-pointer transition-all ${
                          role === 'student' 
                            ? 'bg-white shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] border border-primary/10' 
                            : 'hover:bg-white/80 hover:shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff]'
                        }`}
                      >
                        <RadioGroupItem value="student" id="student" className="sr-only" />
                        <User className={`h-5 w-5 stroke-[1.5] ${role === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={role === 'student' ? 'font-[600]' : 'font-[400]'}>Student</span>
                      </Label>
                      
                      <Label
                        htmlFor="admin"
                        className={`flex items-center justify-center space-x-2 rounded-[10px] p-3 cursor-pointer transition-all ${
                          role === 'admin' 
                            ? 'bg-white shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] border border-primary/10' 
                            : 'hover:bg-white/80 hover:shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff]'
                        }`}
                      >
                        <RadioGroupItem value="admin" id="admin" className="sr-only" />
                        <ShieldCheck className={`h-5 w-5 stroke-[1.5] ${role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={role === 'admin' ? 'font-[600]' : 'font-[400]'}>Admin</span>
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  {/* ID Card Upload Field - Only shown for students */}
                  {role === 'student' && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="idCard" className="text-sm font-[600] block mb-2">
                        College ID Card <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-primary/30 rounded-[12px] p-4 bg-[#e0e0e0] shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]">
                        {idCardPreview ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                              <img 
                                src={idCardPreview} 
                                alt="ID Card Preview" 
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setIdCard(null);
                                  setIdCardPreview(null);
                                }}
                                className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">Click to change</p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <p className="mt-2 text-sm font-[500]">Upload your college ID card</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              JPG, PNG or PDF up to 5MB
                            </p>
                          </div>
                        )}
                        <input
                          id="idCard"
                          name="idCard"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                          onChange={handleIdCardChange}
                          className="sr-only"
                          required={role === 'student'}
                        />
                        <label 
                          htmlFor="idCard"
                          className="mt-3 block w-full cursor-pointer"
                        >
                          <Button 
                            type="button" 
                            variant={idCardPreview ? "outline" : "default"}
                            className="w-full"
                            onClick={() => document.getElementById('idCard')?.click()}
                          >
                            {idCardPreview ? 'Change ID Card' : 'Select ID Card'}
                          </Button>
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your ID card is required for account verification. Your account will be in pending status until verification.
                      </p>
                    </div>
                  )}
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
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Create Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground px-6 mt-3">
                  By creating an account, you agree to our <a href="#" className="text-primary hover:text-primary/80 hover:underline transition-all">Terms of Service</a> and <a href="#" className="text-primary hover:text-primary/80 hover:underline transition-all">Privacy Policy</a>
                </p>
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
                  Already have an account?
                </p>
                <Link to="/login" className="inline-block w-full">
                  <Button 
                    variant="outline" 
                    className="w-full h-11 font-[500] border-primary/20 bg-[#e0e0e0] rounded-[12px]
                              shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]
                              hover:bg-white/90 hover:transform hover:scale-[1.02] 
                              hover:shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]
                              transition-all duration-300 btn-ripple"
                  >
                    Sign In Instead
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