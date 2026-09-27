"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function subscribeToNewsletter(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const honeypot = formData.get("website"); 

  if (honeypot) {
    return { success: false, error: "Something went wrong." };
  }

  if (!name || !email) {
    return { success: false, error: "Please fill in all fields." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert([{ name, email }]);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "This email is already subscribed." };
    }
    console.error("Supabase insert error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, error: "" };
}
