'use client'

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { submitFeedback } from '@/lib/actions';
import feedbackSchema from '@/lib/schema/feedback';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { toast } from 'sonner';
import { useMessages } from '@/components/messageProvider';

const categories = [
  { value: "wrong-job-info", label: "Wrong or outdated job information" },
  { value: "wrong-recruitment-info", label: "Wrong or outdated recruitment information" },
  { value: "missing-job", label: "Missing job" },
  { value: "missing-recruitment", label: "Missing recruitment" },
  { value: "website-bug", label: "Website bug or issue" },
  { value: "general-feedback", label: "General feedback" },
  { value: "other", label: "Other" }
];

export default function Feedback() {
  const { messages } = useMessages();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "",
      message: ""
    }
  });

  async function onSubmit(data) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    const { status, msg } = await submitFeedback(formData);

    if (status === 200) {
      toast.success(msg, { duration: 1000 });
      reset();
    } else {
      toast.error(msg);
    }
  }

  return (
    <main className='flex flex-col items-center'>
      <h1 className='text-3xl font-bold font-sans'>{messages.feedback.heading}</h1>
      <p className='mt-3 text-center'>
        {messages.feedback.introFirstLine}</p>
      <p className='text-center'>
        {messages.feedback.introSecondLine} <strong>{process.env.NEXT_PUBLIC_NAME}</strong>.
      </p>
      <Card className='mt-10 w-full max-w-md'>
        <CardTitle className='text-xl text-center'>{messages.feedback.formLabels.formTitle}</CardTitle>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>

            {/* Name */}
            <div className='flex flex-col gap-2'>
              <Label>{messages.feedback.formLabels.name}</Label>
              <Input {...register("name")} placeholder="Your name" />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className='flex flex-col gap-2'>
              <Label>{messages.feedback.formLabels.email}</Label>
              <Input {...register("email")} placeholder="your@email.com" />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Category */}
            <div className='flex flex-col gap-2'>
              <Label>{messages.feedback.formLabels.category} *</Label>
              <Controller
                control={control}
                name='category'
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>

            {/* Message */}
            <div className='flex flex-col gap-2'>
              <Label>{messages.feedback.formLabels.message} *</Label>
              <Textarea
                {...register("message")}
                placeholder="Describe the issue..."
                rows={5}
              />
              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? messages.feedback.formLabels.submitBtnActive : messages.feedback.formLabels.submitBtn}
            </Button>

          </form>
        </CardContent>
      </Card>
    </main>
  );
}