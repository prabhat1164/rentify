Overview
Rentify is a web application that connects property buyers and sellers. The platform allows sellers to post their properties, and buyers to browse and express interest in these properties. The application includes features for user registration, login, profile management, property management, and property browsing.

Features

1. User Registration and Login:
    - Users can register as either a Buyer or a Seller.
    - Login functionality to access personalized features.

2. User Roles:
    - Buyer: Can browse properties, express interest in properties, and manage their profile.
    - Seller: Can post new properties, update and delete existing properties, and manage their profile.

3. Profile Management:
    - All users can edit their profile details including profile picture (DP), name, and phone number.

4. Property Management (Seller only):
    - Sellers can post new properties with details such as photo, number of bedrooms and bathrooms, nearby college, hospital, mall, and rent.
    - Sellers can update or delete their properties.

5. Feeds Page:
    - Available to both logged-in and non-logged-in users.
    - Displays all available properties posted by sellers.
    - Properties include details like photo, number of bedrooms and bathrooms, nearby amenities (college, hospital, mall), and rent.
    - Users can sort properties by rent, number of bathrooms, and number of bedrooms.
    - Displays the number of likes for each property.

6. Interest in Property:
    - Logged-in buyers can express interest in a property.
    - When a buyer clicks on the "I'm Interested" button:
        - If the buyer is the same user who posted the property, an alert is shown: "It's your post!"
        - If the buyer is interested in another user's property, an email with the property and seller details is sent to the buyer.
        - The seller is notified about the interested buyer's details.


Installation

1. Clone the repository:
    git clone repo link
    cd rentify

2. Install dependencies:
    npm install

3. Set up the environment variables:
    - Create a .env file in the root directory.
    - Add the following environment variables:
      MONGODB_URI=<your_mongodb_connection_string>
      GMAIL_USER=<mai_will_used_for_triggering_mails>
      GMAIL_PASS=<generated_app_pswd>

4. Start the application:
    npm start

Usage

1. Access the Application:
    - Navigate to http://localhost:3000 in your web browser.

2. Registration and Login:
    - Register as either a Buyer or Seller.
    - Log in to access personalized features.

3. Profile Management:
    - Edit your profile by navigating to the profile page.

4. Property Management for Sellers:
    - Post, update, and delete properties through the seller's dashboard.

5. Browse Properties on Feeds Page:
    - View available properties, sort them by various criteria, and see the number of likes.

6. Express Interest in Properties:
    - Logged-in buyers can express interest in properties and receive details via email.

Technologies Used

- Backend: Node.js, Express.js
- Frontend: EJS, TailwindCSS
- Database: MongoDB
- Authentication: Passport.js
- Email Notifications: Nodemailer