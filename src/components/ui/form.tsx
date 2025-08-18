"use client";

import * as React from "react";
import { Label } from "./label";
import { Input as InputBase } from "./input";
import { Textarea as TextareaBase } from "./textarea";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export const Input = InputBase;
export const Textarea = TextareaBase;

