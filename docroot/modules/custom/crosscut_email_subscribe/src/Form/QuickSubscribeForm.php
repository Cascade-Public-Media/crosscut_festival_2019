<?php

namespace Drupal\crosscut_email_subscribe\Form;

use Drupal\Component\Utility\Html;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\salesforce\SelectQuery;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Defines a "Quick Subscribe" form.
 *
 * This form enables email subscription with a single field for the email
 * address to be subscribed.
 */
class QuickSubscribeForm extends FormBase {

  /**
   * @var LoggerChannelInterface $logger
   */
  protected $logger;

  /**
   * @var bool $debugMode
   */
  protected $debugMode;

  /**
   * Salesforce SFID object for the Account of the Contact to be updated.
   *
   * @var \Drupal\salesforce\SFID
   */
  protected $accountId;

  /**
   * If TRUE, the email will be automatically added to all lists.
   *
   * @var bool
   */
  protected $autoEnroll;

  /**
   * Salesforce API client.
   *
   * @var \Drupal\salesforce\Rest\RestClient
   */
  protected $client;

  /**
   * Salesforce SFID object for the Contact to be updated.
   *
   * @var \Drupal\salesforce\SFID
   */
  protected $contactId;

  /**
   * An email address to subscribe to a mailing list.
   *
   * @var string
   */
  protected $emailAddress;

  /**
   * Node ID of a node to redirect to after form submission.
   *
   * @var null|int
   */
  protected $formRedirect;

  /**
   * Array of lists to choose from.
   *
   * @var array
   */
  protected $listOptions;

  /**
   * QuickSubscribeForm constructor.
   */
  public function __construct(ConfigFactoryInterface $config_factory, LoggerChannelInterface $logger) {
    $this->debugMode = $config_factory
      ->get('crosscut_email_subscribe.settings')
      ->get('debug');
    $this->logger = $logger;
    $this->autoEnroll = FALSE;
    $this->client = \Drupal::service('salesforce.client');
    $this->listOptions = crosscut_email_subscribe_lists();
    $this->formRedirect = NULL;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('logger.channel.crosscut_email_subscribe')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'crosscut_email_subscribe_quick_subscribe_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#attached']['library'][] = 'core/drupal.form';

    // Check for config options in the form arguments.
    $use_ajax = TRUE;
    $build_info = $form_state->getBuildInfo();
    if (isset($build_info['args']) && isset($build_info['args'][0])) {
      $config = $build_info['args'][0];
      if (isset($config['auto_enroll']) && !empty($config['auto_enroll'])) {
        $this->autoEnroll = $config['auto_enroll'];
      }
      if (isset($config['form_redirect']) && !empty($config['form_redirect'])) {
        $this->formRedirect = $config['form_redirect'];
        // Do not use AJAX for form submission when a redirect is set.
        $use_ajax = FALSE;
      }
      if (isset($config['list_options']) && !empty($config['list_options'])) {
        $this->listOptions = $config['list_options'];
      }
    }

    $container_id = Html::getUniqueId($this->getFormId());

    $form['container'] = [
      '#type' => 'container',
      '#attributes' => ['id' => $container_id],
    ];

    $element = array(
      '#title' => $this->t('Quick Subscribe'),
      '#description' => $this->t('Subscribe to a Crosscut email list.'),
      '#attributes' => [
        'class' => [Html::cleanCssIdentifier($this->getFormId())]
      ]
    );

    $element['email_address'] = array(
      '#type' => 'email',
      '#required' => TRUE,
      '#title' => $this->t('Email address'),
      '#title_display' => 'invisible',
      '#attributes' => array(
        'placeholder' => $this->t('Enter your email address'),
      ),
    );

    if (!$this->autoEnroll) {
      $element['lists'] = array(
        '#type' => 'fieldset',
        '#title' => $this->t('Mailing Lists'),
        '#tree' => TRUE,
      );

      $list_names = crosscut_email_subscribe_lists();
      foreach ($this->listOptions as $key => $value) {
        $element['lists'][$key] = array(
          '#type' => 'checkbox',
          '#title' => $list_names[$key],
        );
      }
    }

    $element['actions']['#type'] = 'actions';
    $element['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Subscribe'),
      '#button_type' => 'secondary',
      '#attributes' => ['class' => ['btn', 'btn-secondary']],
    ];

    if ($use_ajax) {
      $element['actions']['submit']['#ajax'] = [
        'callback' => '::promptCallback',
        'wrapper' => $container_id,
        'effect' => 'fade',
        'progress' => [
          'message' => '',
        ],
      ];
    }

    // If auto-enroll is enabled, make the form an inline single field.
    if ($this->autoEnroll) {
      $element['#attributes']['class'][] = 'form-inline';
    }

    $form['container']['form'] = $element;

    // Workaround for potential issues if multiple instances of this form are
    // rendered on the same page.
    /* @url https://www.drupal.org/project/drupal/issues/2821852 */
    $form_state->setRequestMethod('POST');
    $form_state->setCached(TRUE);

    return $form;
  }

  /**
   * AJAX handler for form submission.
   *
   * @param array $form
   *  The original form render array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *  The form state after submission.
   *
   * @return array
   *  A simple element confirming successful submission.
   */
  public function promptCallback(array &$form, FormStateInterface $form_state) {
    if (!empty($form_state->getErrors())) {
      return $form;
    }
    $element = $form['container'];
    $element['form'] = [
      '#type' => 'html_tag',
      '#tag' => 'p',
      '#value' => $this->t('You are now subscribed. Thank you!'),
      '#attributes' => [
        'class' => 'cse-subscribe-complete'
      ]
    ];
    return $element;
  }

  /**
   * {@inheritdoc}
   *
   * Make sure at least one mailing list is selected.
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $lists = $form_state->getValue('lists', array(1));
    $selected = array_sum($lists);
    if ($selected < 1) {
      $form_state->setErrorByName(
        'lists',
        $this->t('Please select at least one mailing list.')
      );
    }

    $email_address = $form_state->getValue('email_address');
    // Drupal's email.validator service has a number of weird issues.
    /* @url https://www.drupal.org/project/drupal/issues/2343043 */
    /* @url https://www.drupal.org/project/drupal/issues/2492667 */
    /* @url https://www.drupal.org/project/drupal/issues/1427516 */
    if (!filter_var($email_address, FILTER_VALIDATE_EMAIL)) {
      $form_state->setErrorByName(
        'email_address',
        $this->t('Invalid email address.')
      );
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->emailAddress = $form_state->getValue('email_address');

    $lists = array();
    if ($this->autoEnroll) {
      $lists = $this->listOptions;
    }
    else {
      foreach ($form_state->getValue('lists') as $list => $selected) {
        if ($selected) {
          $lists[$list] = $list;
        }
      }
    }

    if ($this->debugMode) {
      $build_info = $form_state->getBuildInfo();
      $args = [];
      if (isset($build_info['args'])) {
        $args = var_export($build_info['args'], TRUE);
      }
      $this->logger->debug(
        '%mail: Initiating subscription process.<br/><br><pre>@args</pre>',
        ['%mail' => $this->emailAddress, '@args' => $args]
      );
    }

    $this->getOrCreateContact();
    if (!empty($this->contactId)) {
      try {
        $fields = array_fill_keys(array_keys($lists), TRUE);
        $this->client->objectUpdate(
          CES_SALESFORCE_OBJECT_CONTACT,
          (string) $this->contactId,
          $fields
        );
        if ($this->debugMode) {
          $this->logger->debug(
            '%mail: Contact record %id subscribed!',
            ['%mail' => $this->emailAddress, '%id' => $this->contactId]
          );
        }
      }
      catch (\Exception $e) {
        $this->logger->error(
          'Salesforce Contact update error: @message',
          ['@message' => $e->getMessage()]
        );
      }
    }

    if (!empty($this->formRedirect)) {
      $form_state->setRedirect(
        'entity.node.canonical',
        ['node' => $this->formRedirect]
      );
    }

    if ($this->debugMode) {
      $this->logger->debug(
        '%mail: Subscription process complete.',
        ['%mail' => $this->emailAddress]
      );
    }
  }

  /**
   * Get or create a Salesforce Contact to update.
   *
   * This function will set $this->contactId if necessary. For existing Contact
   * objects, this will only happen if the Contact is not already subscribed to
   * selected lists.
   */
  private function getOrCreateContact() {
    if ($this->client->isAuthorized()) {
      // Evaluate all potential email fields.
      $potential_email_fields = array(
        CES_SALESFORCE_CONTACT_EMAIL,
        CES_SALESFORCE_CONTACT_EMAIL_HOME,
        CES_SALESFORCE_CONTACT_EMAIL_OTHER,
        CES_SALESFORCE_CONTACT_EMAIL_WORK,
        CES_SALESFORCE_CONTACT_EMAIL_MVAULT,
      );

      $query = new SelectQuery(CES_SALESFORCE_OBJECT_CONTACT);
      $query->fields = array(
        CES_SALESFORCE_CONTACT_ID,
        CES_SALESFORCE_NEWSLETTER_CROSSCUT_DAILY,
        CES_SALESFORCE_NEWSLETTER_CROSSCUT_WEEKLY,
      );

      // SelectQuery->addCondition does not support OR so this must be built
      // manually.
      $last_field = array_pop($potential_email_fields);
      $condition_string = '';
      foreach ($potential_email_fields as $field) {
        $condition_string .= $field . "+=+'" . $this->emailAddress . "'+OR+";
      }
      $condition_string .= $last_field;
      $query->addCondition(
        $condition_string,
        "'" . $this->emailAddress . "'"
      );

      try {
        /* @var \Drupal\salesforce\SelectQueryResult $response */
        $response = $this->client->query($query);
        if ($response->size() > 0) {
          // Only use the first result (ignoring any duplicates).
          $records = $response->records();
          /* @var \Drupal\salesforce\SObject $record */
          $record = reset($records);
          $this->contactId = $record->id();
          if ($this->debugMode) {
            $this->logger->debug(
              '%mail: Existing Contact record %id found.',
              ['%mail' => $this->emailAddress, '%id' => $this->contactId]
            );
          }
        }
        else {
          $this->contactId = $this->createSalesforceContact();
          if ($this->debugMode) {
            $this->logger->debug(
              '%mail: No existing Contact found.',
              ['%mail' => $this->emailAddress]
            );
          }
        }
      }
      catch (\Exception $e) {
        $this->logger->error(
          'Salesforce Select query error: @message',
          ['@message' => $e->getMessage()]
        );
      }
    }
  }

  /**
   * Create a Salesforce Account for the Contact to be added.
   *
   * @return null|\Drupal\salesforce\SFID
   *   The Salesforce SFID object for the created Account or NULL if creation
   *   failed.
   */
  private function createSalesforceAccount() {
    $account_id = NULL;

    if (!empty($this->client)) {
      $now = new DrupalDateTime();

      try {
        $account_id = $this->client->objectCreate(
          CES_SALESFORCE_OBJECT_ACCOUNT, array(
            CES_SALESFORCE_ACTIVE => TRUE,
            // Required field.
            CES_SALESFORCE_ACCOUNT_STATION => 'KCTS 9',
            // Required -- will be updated when Contact is created.
            CES_SALESFORCE_ACCOUNT_NAME => 'default Account Name',
            CES_SALESFORCE_CROSSCUT_CONSTITUENT => TRUE,
            CES_SALESFORCE_ACCOUNT_SOURCE => 'Email Signup Crosscut',
            CES_SALESFORCE_ACCOUNT_DATE => $now->format('Y-m-d')
          )
        );
        if ($this->debugMode) {
          $this->logger->debug(
            '%mail: New Account record %id created.',
            ['%mail' => $this->emailAddress, '%id' => $account_id]
          );
        }
      }
      catch (\Exception $e) {
        $this->logger->error(
          'Salesforce Account creation error: @message',
          ['@message' => $e->getMessage()]
        );
      }
    }

    return $account_id;
  }

  /**
   * Create a Salesforce Contact with only an email address.
   *
   * @return null|\Drupal\salesforce\SFID
   *   The Salesforce SFID object for the created Contact or NULL if creation
   *   failed.
   */
  private function createSalesforceContact() {
    $contact_id = NULL;

    if (empty($this->accountId)) {
      $this->accountId = $this->createSalesforceAccount();
    }

    if (!empty($this->accountId) && !empty($this->emailAddress)) {
      try {
        $contact_id = $this->client->objectCreate(
          CES_SALESFORCE_OBJECT_CONTACT, array(
            CES_SALESFORCE_ACTIVE => TRUE,
            CES_SALESFORCE_CONTACT_ACCOUNT_ID => (string) $this->accountId,
            CES_SALESFORCE_CONTACT_PREFERRED => TRUE,
            CES_SALESFORCE_CONTACT_PREFERRED_EMAIL => 'Home',
            CES_SALESFORCE_CONTACT_EMAIL_HOME => $this->emailAddress,
            CES_SALESFORCE_CONTACT_FIRSTNAME => '_no first name',
            CES_SALESFORCE_CONTACT_LASTNAME => '_no last name',
          )
        );
        if ($this->debugMode) {
          $this->logger->debug(
            '%mail: New Contact record %id created.',
            ['%mail' => $this->emailAddress, '%id' => $contact_id]
          );
        }
      }
      catch (\Exception $e) {
        $this->logger->error(
          'Salesforce Contact creation error: @message',
          ['@message' => $e->getMessage()]
        );
      }
    }

    return $contact_id;
  }

}
