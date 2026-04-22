'use client'

import { useForm } from 'react-hook-form';
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
  const {
    register,
    handleSubmit,
    setValue,
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
      toast.success(msg);
      reset();
    } else {
      toast.error(msg);
    }
  }

  return (
    <main className='flex flex-col items-center'>
      <h1 className='text-3xl font-bold font-sans'>Feedback</h1>
      <p className='mt-3 text-center'>
        Found something wrong? Missing a job or recruitment? Or just want to share your thoughts?</p>
      <p className='text-center'>
        We read every submission and use it to improve{' '} {process.env.NEXT_PUBLIC_NAME}.
      </p>
      <Card className='mt-10 w-full max-w-md'>
        <CardTitle className='text-xl text-center'>Feedback Form</CardTitle>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>

            {/* Name */}
            <div className='flex flex-col gap-2'>
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Your name" />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className='flex flex-col gap-2'>
              <Label>Email</Label>
              <Input {...register("email")} placeholder="your@email.com" />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Category */}
            <div className='flex flex-col gap-2'>
              <Label>Category *</Label>
              <Select onValueChange={(val) => setValue("category", val)}>
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
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>

            {/* Message */}
            <div className='flex flex-col gap-2'>
              <Label>Message *</Label>
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
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </main>
  );
}