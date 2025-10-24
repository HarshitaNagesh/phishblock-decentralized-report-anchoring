"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { connectWallet, getCurrentAddress, formatAddress, onAccountsChanged } from "@/lib/wallet";
import { useToast } from "@/hooks/use-toast";

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    getCurrentAddress().then(setAddress).catch(() => setAddress(null));

    // Listen for account changes
    onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      } else {
        setAddress(accounts[0]);
        toast({
          title: "Account Changed",
          description: `Switched to ${formatAddress(accounts[0])}`,
        });
      }
    });
  }, [toast]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const { address: connectedAddress } = await connectWallet();
      setAddress(connectedAddress);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${formatAddress(connectedAddress)}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-mono">{formatAddress(address)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
