    document.getElementById('paymentForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const phone = document.getElementById('phone').value;
      const amount = document.getElementById('amount').value;

      const response = await fetch('http://127.0.0.1:8000/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount })
      });

      const data = await response.json();
      alert(data.message || 'Payment initiated!');
    });
