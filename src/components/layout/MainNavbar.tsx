  {/* Desktop Navigation */}
  <div className="hidden md:flex items-center justify-between w-full">
    <div className="flex items-center space-x-8">
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src="/images/logo.png"
          alt="Cameroon Made Market"
          width={40}
          height={40}
          className="w-10 h-10"
        />
        <span className="text-xl font-bold text-primary">Cameroon Made Market</span>
      </Link>
    </div>

    <div className="flex items-center space-x-8">
      <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
        Home
      </Link>
      <Link href="/products" className="text-gray-700 hover:text-primary transition-colors">
        Products
      </Link>
      <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
        About
      </Link>
      <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors">
        Contact
      </Link>
    </div>

    <div className="flex items-center space-x-4">
      <Link href="/cart" className="relative">
        <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-primary transition-colors" />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </Link>
      <Link href="/account" className="text-gray-700 hover:text-primary transition-colors">
        <User className="w-6 h-6" />
      </Link>
    </div>
  </div> 