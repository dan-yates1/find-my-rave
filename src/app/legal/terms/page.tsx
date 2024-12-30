export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using Find My Rave (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">2. User Accounts</h2>
        <p className="mb-4">You are responsible for:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and current registration information</li>
          <li>Notifying us immediately of any unauthorized use</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">3. Event Listings</h2>
        <p className="mb-4">When submitting events, you agree that:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>All information provided is accurate and complete</li>
          <li>You have the right to list the event</li>
          <li>The event complies with all applicable laws and regulations</li>
          <li>You will update event information if details change</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. User Content</h2>
        <p className="mb-4">
          You retain ownership of content you submit, but grant us a license to use, modify, and display it in connection with the Service. You agree not to post content that is illegal, offensive, or violates others&apos; rights.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Prohibited Activities</h2>
        <p className="mb-4">Users must not:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Use the Service for any illegal purpose</li>
          <li>Post false or misleading information</li>
          <li>Attempt to gain unauthorized access</li>
          <li>Interfere with the proper operation of the Service</li>
          <li>Scrape or collect user data without permission</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Event Bookings</h2>
        <p className="mb-4">
          Find My Rave facilitates event discovery but is not responsible for events listed by third parties. Transactions and arrangements are between users and event organizers.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">7. Intellectual Property</h2>
        <p className="mb-4">
          The Service and its original content, features, and functionality are owned by Find My Rave and are protected by international copyright, trademark, and other laws.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">8. Termination</h2>
        <p className="mb-4">
          We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">9. Disclaimer of Warranties</h2>
        <p className="mb-4">
          The Service is provided &quot;as is&quot; without warranties of any kind, whether express or implied. We do not guarantee the accuracy, completeness, or reliability of any events or content.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">10. Limitation of Liability</h2>
        <p className="mb-4">
          Find My Rave shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact Us</h2>
        <p className="mb-4">
          If you have questions about these Terms, please contact us at terms@findmyrave.com
        </p>
      </div>
    </div>
  );
} 