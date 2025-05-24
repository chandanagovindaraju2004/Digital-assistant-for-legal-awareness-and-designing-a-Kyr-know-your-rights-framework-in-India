
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", 
  "03:00 PM", "04:00 PM", "05:00 PM"
];

const lawyerTypes = [
  { id: "family", name: "Family Law" },
  { id: "criminal", name: "Criminal Law" },
  { id: "civil", name: "Civil Law" },
  { id: "corporate", name: "Corporate Law" },
  { id: "property", name: "Property Law" },
  { id: "employment", name: "Employment Law" },
  { id: "immigration", name: "Immigration Law" },
];

type FormValues = {
  name: string;
  email: string;
  phone: string;
  lawyerType: string;
  date: Date | undefined;
  time: string;
  details: string;
};

const LegalConsultation = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Please sign in to book a consultation");
        navigate("/auth");
      } else {
        setUser(data.session.user);
      }
    };

    checkAuth();
  }, [navigate]);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      lawyerType: "",
      date: undefined,
      time: "",
      details: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to book a consultation");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format date to match our database schema
      const formattedDate = data.date ? format(data.date, 'yyyy-MM-dd') : '';

      const { error } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          lawyer_type: data.lawyerType,
          date: formattedDate,
          time: data.time,
          details: data.details || null
        });

      if (error) {
        console.error("Error booking consultation:", error);
        toast.error("Failed to book consultation. Please try again.");
        return;
      }

      toast.success("Consultation booked successfully! We will contact you shortly.");
      
      // Redirect to dashboard after successful booking
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && profile) {
          form.setValue('name', profile.name || '');
          form.setValue('email', user.email || '');
          form.setValue('phone', profile.phone || '');
        }
      };
      
      fetchUserProfile();
    }
  }, [user, form]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-legal-navy mb-6 text-center">Book a Legal Consultation</h1>
            <p className="text-lg text-legal-darkgray mb-8 text-center">
              Fill out the form below to schedule a consultation with one of our experienced attorneys.
            </p>
            
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-legal-navy">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              {...field}
                              className="border-gray-300 focus:border-legal-navy"
                              required
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-legal-navy">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email address" 
                              {...field}
                              className="border-gray-300 focus:border-legal-navy"
                              required
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-legal-navy">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="Enter your phone number" 
                              {...field}
                              className="border-gray-300 focus:border-legal-navy"
                              required
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lawyerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-legal-navy">Type of Legal Help</FormLabel>
                          <FormControl>
                            <select 
                              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-legal-navy"
                              {...field}
                              required
                              disabled={isSubmitting}
                            >
                              <option value="">Select type of legal help</option>
                              {lawyerTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="font-medium text-legal-navy">Preferred Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isSubmitting}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setDate(date);
                                }}
                                disabled={(date) => {
                                  // Disable past dates and weekends
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const day = date.getDay();
                                  return date < today || day === 0 || day === 6;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-legal-navy">Preferred Time</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={!date || isSubmitting}
                                >
                                  {field.value ? field.value : <span>Select a time</span>}
                                  <Clock className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                              <div className="grid gap-1 p-2 max-h-60 overflow-y-auto">
                                {timeSlots.map((time) => (
                                  <Button
                                    key={time}
                                    variant="ghost"
                                    className={cn(
                                      "justify-start font-normal",
                                      field.value === time && "bg-legal-lightgray"
                                    )}
                                    onClick={() => {
                                      field.onChange(time);
                                      setTimeSlot(time);
                                    }}
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium text-legal-navy">Case Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide brief details about your legal issue"
                            className="min-h-[120px] border-gray-300 focus:border-legal-navy"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          This information will help our attorney prepare for your consultation.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="text-center pt-4">
                    <Button 
                      type="submit" 
                      className="bg-legal-navy hover:bg-opacity-90 text-white py-2 px-6 rounded-md text-lg w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Book Consultation"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalConsultation;
