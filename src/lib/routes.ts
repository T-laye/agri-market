export const pageRoutes = {
	home: "/",

	marketplace: "/marketplace",
	cart: "/cart",
	checkout: "/checkout",
	checkoutCallback: "/checkout/callback",
	orderConfirmation: "/checkout/success",

	auth: {
		login: "/auth/login",
		signup: "/auth/signup",
		forgotPassword: "/auth/forgot-password",
		resetPassword: "/auth/reset-password",
	},
	becomeFarmer: "/dashboard/become-farmer",

	dashboard: {
		index: "/dashboard",
		profile: "/dashboard/profile",
		settings: "/dashboard/settings",
		verification: "/dashboard/verification",
		products: "/dashboard/products",
		orders: "/dashboard/orders",
		myOrders: "/dashboard/my-orders",
		earnings: "/dashboard/earnings",
		payoutSettings: "/dashboard/payout-settings",
		messages: "/dashboard/messages",
		analytics: "/dashboard/analytics",
	},

	admin: {
		index: "/admin",
		users: "/admin/users",
		farmers: "/admin/farmers",
		products: "/admin/products",
		orders: "/admin/orders",
	},
};
