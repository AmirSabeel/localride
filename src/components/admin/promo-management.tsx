"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Calendar, Percent, Tag, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Promo {
  id: string;
  code: string;
  discount: number;
  maxDiscount: number;
  minFare: number;
  used: number;
  limit: number;
  validFrom: string;
  validTo: string;
  active: boolean;
}

const INITIAL_PROMOS: Promo[] = [
  { id: "P001", code: "FIRST50", discount: 50, maxDiscount: 200, minFare: 100, used: 3450, limit: 5000, validFrom: "2025-01-01", validTo: "2025-12-31", active: true },
  { id: "P002", code: "RIDE20", discount: 20, maxDiscount: 100, minFare: 150, used: 1240, limit: 3000, validFrom: "2025-03-01", validTo: "2025-09-30", active: true },
  { id: "P003", code: "WEEKEND30", discount: 30, maxDiscount: 150, minFare: 200, used: 890, limit: 2000, validFrom: "2025-06-01", validTo: "2025-08-31", active: true },
  { id: "P004", code: "NEWUSER100", discount: 100, maxDiscount: 300, minFare: 0, used: 5670, limit: 10000, validFrom: "2025-01-01", validTo: "2025-12-31", active: true },
  { id: "P005", code: "REFER25", discount: 25, maxDiscount: 75, minFare: 100, used: 2100, limit: 5000, validFrom: "2025-02-01", validTo: "2025-12-31", active: false },
  { id: "P006", code: "FLASH15", discount: 15, maxDiscount: 50, minFare: 50, used: 0, limit: 1000, validFrom: "2025-07-15", validTo: "2025-07-20", active: true },
];

interface PromoForm {
  code: string;
  discount: string;
  maxDiscount: string;
  minFare: string;
  limit: string;
  validFrom: string;
  validTo: string;
}

const EMPTY_FORM: PromoForm = { code: "", discount: "", maxDiscount: "", minFare: "", limit: "", validFrom: "", validTo: "" };

export default function PromoManagement() {
  const [promos, setPromos] = useState<Promo[]>(INITIAL_PROMOS);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PromoForm>(EMPTY_FORM);

  const handleToggle = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newActive = !p.active;
          toast.success(`${p.code} ${newActive ? "activated" : "deactivated"}`);
          return { ...p, active: newActive };
        }
        return p;
      })
    );
  };

  const handleDelete = (id: string) => {
    const promo = promos.find((p) => p.id === id);
    setPromos((prev) => prev.filter((p) => p.id !== id));
    toast.success(`Promo ${promo?.code} deleted`);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    toast.success(`Copied ${code} to clipboard`);
  };

  const handleCreate = () => {
    if (!form.code || !form.discount || !form.maxDiscount || !form.limit || !form.validFrom || !form.validTo) {
      toast.error("Please fill all required fields");
      return;
    }
    const newPromo: Promo = {
      id: `P${Date.now()}`,
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      maxDiscount: Number(form.maxDiscount),
      minFare: Number(form.minFare) || 0,
      used: 0,
      limit: Number(form.limit),
      validFrom: form.validFrom,
      validTo: form.validTo,
      active: true,
    };
    setPromos((prev) => [newPromo, ...prev]);
    setForm(EMPTY_FORM);
    setShowCreate(false);
    toast.success(`Promo ${newPromo.code} created`);
  };

  return (
    <motion.div
      className="p-4 md:p-6 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Promo Codes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{promos.length} promo codes</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => setShowCreate(true)}
            className="btn-premium gradient-primary text-white border-0 rounded-xl h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </motion.div>
      </motion.div>

      {/* Promo Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {promos.map((promo, idx) => {
            const usagePct = Math.round((promo.used / promo.limit) * 100);
            return (
              <motion.div
                key={promo.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="glass rounded-2xl shadow-premium p-4 hover:shadow-float transition-premium"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Code + Discount */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Tag className="h-5 w-5 text-primary" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <motion.button
                          onClick={() => handleCopy(promo.code)}
                          className="font-mono text-base md:text-lg font-bold tracking-wider hover:text-primary transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {promo.code}
                        </motion.button>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => handleCopy(promo.code)} />
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${promo.active ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-muted-foreground bg-muted/50"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${promo.active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                          {promo.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Percent className="h-3 w-3" />
                          {promo.discount}% off
                        </span>
                        <span className="text-xs text-muted-foreground">Max ₹{promo.maxDiscount}</span>
                        <span className="text-xs text-muted-foreground">Min ₹{promo.minFare}</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage + Validity */}
                  <div className="flex-1 sm:min-w-[200px] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">{promo.used.toLocaleString()} / {promo.limit.toLocaleString()}</span>
                    </div>
                    <Progress value={usagePct} className="h-2" />
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {promo.validFrom} → {promo.validTo}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={promo.active}
                        onCheckedChange={() => handleToggle(promo.id)}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-premium"
                        onClick={() => toast.info(`Editing ${promo.code}`)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-premium"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-strong rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Promo Code</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Set up a new promotional discount for riders
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Promo Code</label>
              <Input
                placeholder="e.g. SUMMER25"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="rounded-xl h-10 font-mono tracking-wider"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Discount %</label>
                <Input
                  type="number"
                  placeholder="25"
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Max Discount (₹)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={form.maxDiscount}
                  onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                  className="rounded-xl h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Min Fare (₹)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={form.minFare}
                  onChange={(e) => setForm((f) => ({ ...f, minFare: e.target.value }))}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Usage Limit</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={form.limit}
                  onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
                  className="rounded-xl h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valid From</label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Valid To</label>
                <Input
                  type="date"
                  value={form.validTo}
                  onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
                  className="rounded-xl h-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleCreate} className="btn-premium gradient-primary text-white border-0 rounded-xl">
              Create Promo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}