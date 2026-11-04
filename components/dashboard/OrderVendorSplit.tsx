import React from "react";
import { Store, Percent, Wallet, Building } from "lucide-react";

interface OrderProductItem {
  quantity: number;
  price: number;
  product?: {
    _id: string;
    title: string;
    vendor?: {
      _id: string;
      businessName: string;
      email: string;
    };
  };
}

interface OrderVendorSplitProps {
  products: OrderProductItem[];
  currency?: string;
}

export const OrderVendorSplit: React.FC<OrderVendorSplitProps> = ({
  products = [],
  currency = "₦",
}) => {
  // Group products by vendor (or Platform if vendor is undefined)
  const groupedByVendor = products.reduce((acc, item) => {
    const vendorId = item.product?.vendor?._id || "platform";
    const vendorName = item.product?.vendor?.businessName || "Platform Owned (Direct Marketplace)";
    const isPlatform = vendorId === "platform";

    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendorId,
        vendorName,
        isPlatform,
        items: [],
        subtotal: 0,
      };
    }

    const itemTotal = (item.price || 0) * (item.quantity || 1);
    acc[vendorId].items.push(item);
    acc[vendorId].subtotal += itemTotal;

    return acc;
  }, {} as Record<string, { vendorId: string; vendorName: string; isPlatform: boolean; items: OrderProductItem[]; subtotal: number }>);

  const vendorGroups = Object.values(groupedByVendor);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Multi-Vendor Allocation & Settlement Breakdown
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {vendorGroups.length} allocation group{vendorGroups.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendorGroups.map((group) => {
          // Standard 5% commission rate applied uniformly on backend
          const commissionRate = group.isPlatform ? 0 : 0.05;
          const commissionAmount = group.subtotal * commissionRate;
          const netSettlement = group.isPlatform ? group.subtotal : group.subtotal - commissionAmount;

          return (
            <div
              key={group.vendorId}
              className={`rounded-xl border p-4 space-y-3 ${
                group.isPlatform ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 bg-slate-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  {group.isPlatform ? (
                    <Building className="h-4 w-4 text-shop-dark-green" />
                  ) : (
                    <Store className="h-4 w-4 text-emerald-600" />
                  )}
                  <span className="font-semibold text-slate-900 text-sm">
                    {group.vendorName}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {group.items.length} item{group.items.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Item summaries */}
              <div className="space-y-1.5 text-xs">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span className="truncate max-w-[200px]">
                      {item.product?.title || "Item"} × {item.quantity}
                    </span>
                    <span className="font-mono text-slate-800">
                      ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial split */}
              <div className="border-t border-slate-200/80 pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Vendor Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    ₦{group.subtotal.toLocaleString()}
                  </span>
                </div>

                {!group.isPlatform ? (
                  <>
                    <div className="flex justify-between text-slate-500">
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3 text-emerald-600" />
                        Marketplace Fee (5%):
                      </span>
                      <span className="font-medium text-emerald-700">
                        -₦{commissionAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-sm">
                      <span className="flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5 text-shop-dark-green" />
                        Net Vendor Settlement:
                      </span>
                      <span className="text-shop-dark-green">
                        ₦{netSettlement.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-bold text-shop-dark-green border-t border-slate-200 pt-1 text-sm">
                    <span>Direct Marketplace Revenue:</span>
                    <span>₦{group.subtotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

