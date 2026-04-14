/**
 * ConfirmDialog Component
 *
 * Confirmation dialog using shadcn/ui Dialog
 */

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ConfirmDialogProps } from "./DataTable/types";

export const ConfirmDialog = React.forwardRef<
  HTMLDivElement,
  ConfirmDialogProps
>(
  (
    {
      title,
      description,
      actionLabel = "Confirm",
      actionVariant = "default",
      cancelLabel = "Cancel",
      open,
      onOpenChange,
      onConfirm,
      onCancel,
      isLoading = false,
    },
    ref,
  ) => {
    const handleConfirm = async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch (error) {
        console.error("Confirmation error:", error);
      }
    };

    const handleCancel = () => {
      onCancel?.();
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent ref={ref} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant={actionVariant}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

ConfirmDialog.displayName = "ConfirmDialog";
