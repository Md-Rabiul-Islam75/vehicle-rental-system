(async () => {
  const base = 'http://localhost:3000/api/v1';
  const log = (label, obj) => console.log('\n=== ' + label + ' ===\n', JSON.stringify(obj, null, 2));

  const post = async (url, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    return res.json();
  };

  const put = async (url, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
    return res.json();
  };

  try {
    // 1) create admin
    const adminSignup = await post(`${base}/auth/signup`, {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpass',
      phone: '+10000000000',
      role: 'admin'
    });
    log('admin signup', adminSignup);

    // 2) create customer
    const custSignup = await post(`${base}/auth/signup`, {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
      phone: '01712345678',
      role: 'customer'
    });
    log('customer signup', custSignup);

    // 3) admin signin
    const adminSignin = await post(`${base}/auth/signin`, { email: 'admin@example.com', password: 'adminpass' });
    log('admin signin', adminSignin);
    const adminToken = adminSignin?.data?.token;

    // 4) create vehicle
    const vehicleCreate = await post(`${base}/vehicles`, {
      vehicle_name: 'Toyota Camry 2024',
      type: 'car',
      registration_number: 'ABC-1234',
      daily_rent_price: 50,
      availability_status: 'available'
    }, adminToken);
    log('create vehicle', vehicleCreate);
    const vehicleId = vehicleCreate?.data?.id;

    // 5) customer signin
    const custSignin = await post(`${base}/auth/signin`, { email: 'john.doe@example.com', password: 'securePassword123' });
    log('customer signin', custSignin);
    const custToken = custSignin?.data?.token;
    const custId = custSignup?.data?.id || (custSignin?.data?.user?.id);

    // 6) create booking
    const bookingCreate = await post(`${base}/bookings`, {
      customer_id: custId,
      vehicle_id: vehicleId,
      rent_start_date: new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,10),
      rent_end_date: new Date(Date.now() + 4*24*60*60*1000).toISOString().slice(0,10)
    }, custToken);
    log('create booking', bookingCreate);

    console.log('\nSmoke test finished.');
  } catch (err) {
    console.error('Smoke test error:', err);
  }
})();
