"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { ReportForm } from "@/components/ReportForm";
import { ReportsList } from "@/components/ReportsList";
import { StatsCards } from "@/components/StatsCards";
import { Shield } from "lucide-react";
import { Toaster } from "sonner";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReportSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">PhishGuard</h1>
                <p className="text-xs text-muted-foreground">Decentralized Scam Reporting</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletConnect />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Community-Powered Scam Protection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Report phishing URLs and scam wallet addresses. Community votes validate entries,
              with reports anchored on-chain for immutable verification.
            </p>
          </div>

          {/* Stats */}
          <StatsCards key={refreshKey} />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <ReportForm onSuccess={handleReportSuccess} />
            </div>
            <div>
              <ReportsList key={refreshKey} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Hardhat, Prisma, and Supabase</p>
        </div>
      </footer>
    </div>
  );
}