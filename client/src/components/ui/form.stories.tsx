import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";
import { Button } from "./button";

const meta = {
  title: "Compound/Form",
  component: Form,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

function BasicFormExample() {
  const form = useForm({
    defaultValues: {
      username: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="w-full px-3 py-2 border border-border-200 rounded-md bg-background-100 text-foreground-100"
                  placeholder="Enter username"
                />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export const Default: Story = {
  render: () => <BasicFormExample />,
};

function FormWithValidationExample() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: { email: string }) => {
    if (!data.email.includes("@")) {
      form.setError("email", { message: "Please enter a valid email" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="email"
                  className="w-full px-3 py-2 border border-border-200 rounded-md bg-background-100 text-foreground-100"
                  placeholder="Enter email"
                />
              </FormControl>
              <FormDescription>We'll never share your email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export const WithValidation: Story = {
  render: () => <FormWithValidationExample />,
};

function FormWithErrorExample() {
  const form = useForm({
    defaultValues: {
      password: "",
    },
  });

  form.setError("password", {
    message: "Password must be at least 8 characters",
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="password"
                  className="w-full px-3 py-2 border border-destructive rounded-md bg-background-100 text-foreground-100"
                  placeholder="Enter password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export const WithError: Story = {
  render: () => <FormWithErrorExample />,
};

function MultiFieldFormExample() {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      bio: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="w-full px-3 py-2 border border-border-200 rounded-md bg-background-100 text-foreground-100"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="w-full px-3 py-2 border border-border-200 rounded-md bg-background-100 text-foreground-100"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="w-full px-3 py-2 border border-border-200 rounded-md bg-background-100 text-foreground-100 min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </FormControl>
              <FormDescription>Max 200 characters.</FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit">Save Profile</Button>
      </form>
    </Form>
  );
}

export const MultipleFields: Story = {
  render: () => <MultiFieldFormExample />,
};
