import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  inquiry: z.string().trim().min(1, "Please share a few details about your inquiry"),
});

type ContactValues = z.infer<typeof contactSchema>;

// Update this endpoint with your real contact form handler when available.
const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

const ContactForm = () => {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      inquiry: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: ContactValues) => {
    try {
      if (CONTACT_ENDPOINT) {
        const response = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error("Unable to submit your request. Please try again.");
        }
      } else {
        // TODO: Replace this placeholder when wiring the contact API endpoint.
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      toast.success("Thanks! We'll reach out within one business day.");
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  const { isValid, isSubmitting } = form.formState;

  return (
    <Card className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-background/95 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <span className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent" />
      <CardHeader className="relative space-y-2 pb-6">
        <CardTitle className="text-2xl font-semibold text-foreground">Send us a message</CardTitle>
        <p className="text-sm text-muted-foreground">We'll respond within one business day.</p>
      </CardHeader>
      <CardContent className="relative p-6 pt-0">
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full Name" autoComplete="name" />
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
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your email address" inputMode="email" autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inquiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About your inquiry</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your message"
                      rows={5}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
