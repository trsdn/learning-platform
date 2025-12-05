@learning @browse
Feature: Browse Learning Topics
  As a learner
  I want to browse available learning topics
  So that I can choose what to study

  Background:
    Given I am logged in as a learner

  @LP-001 @smoke
  Scenario: View available topics on dashboard
    Given I am on the dashboard
    When I look at the topic cards
    Then I should see a list of available topics
    And each topic should display its title
    And each topic should display its progress

  @LP-002
  Scenario: Navigate to a topic
    Given I am on the dashboard
    When I click on a topic card
    Then I should see the learning paths for that topic

  @LP-003
  Scenario: View learning path details
    Given I am viewing a topic
    When I look at the learning paths
    Then each learning path should display its title
    And each learning path should display its description
    And each learning path should display its progress percentage

  @LP-004
  Scenario: Filter topics by progress
    Given I am on the dashboard
    When I filter by "in progress"
    Then I should only see topics I have started

  @LP-005 @accessibility
  Scenario: Topics are accessible via keyboard navigation
    Given I am on the dashboard
    When I navigate using only the keyboard
    Then I should be able to focus on each topic card
    And I should be able to activate a topic with Enter key
