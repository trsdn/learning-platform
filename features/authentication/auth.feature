@authentication
Feature: Authentication
  As a user
  I want to securely access my account
  So that my learning progress is saved and private

  @AU-001 @smoke
  Scenario: View login options
    Given I am not logged in
    When I visit the application
    Then I should see login options
    And I should be able to choose my authentication method

  @AU-002
  Scenario: Login with email and password
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be logged in
    And I should see the dashboard

  @AU-003
  Scenario: Login with invalid credentials
    Given I am on the login page
    When I enter invalid credentials
    And I click the login button
    Then I should see an error message
    And I should remain on the login page

  @AU-004
  Scenario: Login with social provider
    Given I am on the login page
    When I click on a social login button
    Then I should be redirected to the provider
    And after authentication I should return logged in

  @AU-005
  Scenario: Logout
    Given I am logged in
    When I click the logout button
    Then I should be logged out
    And I should see the login page

  @AU-006
  Scenario: Session persists on page refresh
    Given I am logged in
    When I refresh the page
    Then I should still be logged in
    And I should see the dashboard

  @AU-007
  Scenario: Protected routes redirect to login
    Given I am not logged in
    When I try to access a protected page directly
    Then I should be redirected to login
    And after login I should be redirected to the original page

  @AU-008
  Scenario: Register new account
    Given I am on the login page
    When I click on "Sign up"
    And I fill in registration details
    And I submit the registration form
    Then I should receive a confirmation
    And I should be able to log in

  @AU-009
  Scenario: Password reset request
    Given I am on the login page
    When I click "Forgot password"
    And I enter my email address
    And I submit the request
    Then I should receive a password reset email

  @AU-010 @security
  Scenario: Session expires after inactivity
    Given I am logged in
    When I am inactive for the timeout period
    Then my session should expire
    And I should be prompted to log in again
