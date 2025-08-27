'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { User, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PersonalInfoFormData {
  fullname: string;
  email: string;
}

interface PersonalInfoFormProps {
  initialData: PersonalInfoFormData;
  onSubmit: (data: PersonalInfoFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PersonalInfoForm({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}: PersonalInfoFormProps) {
  const form = useForm<PersonalInfoFormData>({
    defaultValues: initialData,
  });

  const handleSubmit = async (data: PersonalInfoFormData) => {
    try {
      console.log("Submitting personal info:", data);
      await onSubmit(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1  gap-4">
              <FormField
                control={form.control}
                name="fullname"
                rules={{
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Full name must be at least 2 characters'
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: emailPattern,
                  message: 'Invalid email format'
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter your email" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

             <div>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </FormLabel>
              <Input
                type="email"
                value={initialData.email}
                disabled
                readOnly
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isValid}
                className="flex items-center text-black gap-2 hover:bg-green-500 hover:text-white"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}