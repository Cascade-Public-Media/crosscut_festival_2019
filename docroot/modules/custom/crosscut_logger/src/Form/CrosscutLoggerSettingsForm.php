<?php

namespace Drupal\crosscut_logger\Form;

use Drupal\Component\Utility\EmailValidator;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Logger\RfcLogLevel;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class CrosscutLoggerSettingsForm.
 */
class CrosscutLoggerSettingsForm extends ConfigFormBase {

  /**
   * @var \Drupal\Component\Utility\EmailValidator
   */
  protected $emailValidator;

  public function __construct(ConfigFactoryInterface $config_factory,
                              EmailValidator $email_validator) {
    parent::__construct($config_factory);
    $this->emailValidator = $email_validator;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('email.validator')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'crosscut_logger_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'crosscut_logger.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('crosscut_logger.settings');

    $form['enable'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable email alerts'),
      '#description' => $this->t('Check to enable sending of email alerts
        to specified addresses when new log entries are created.'),
      '#default_value' => $config->get('enable'),
    ];

    $form['mail'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Email address(es)'),
      '#description' => $this->t('Comma separated list of email addresses
        to send alerts to.'),
      '#rows' => 3,
      '#default_value' => $config->get('mail'),
      '#states' => [
        'required' => ['input[name="enable"]' => ['checked' => TRUE]],
      ],
    ];

    $form['filters'] = [
      '#type' => 'details',
      '#title' => $this->t('Filters'),
      '#description' => $this->t('Filters to apply to all logs before sending
        email alerts. All filters are consider and applied for all logs.'),
      '#open' => FALSE,
    ];

    $form['filters']['level'] = [
      '#type' => 'select',
      '#title' => $this->t('Log level'),
      '#description' => $this->t('Alerts will only be sent for selected 
        log levels, or <strong>all</strong> log levels if none are selected.'),
      '#options' => RfcLogLevel::getLevels(),
      '#default_value' => $config->get('level'),
      '#multiple' => TRUE,
      '#size' => count(RfcLogLevel::getLevels()),
    ];

    $form['filters']['type'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Type'),
      '#description' => $this->t('Types to filter for (e.g. <code>php</code>, 
        <code>cron</code>, etc.). One per line. If no types are specified, all
        types will trigger an email alert.'),
      '#rows' => 5,
      '#default_value' => implode("\r\n", $config->get('type')),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);

    // Validate all provided email addresses.
    $mails = explode(',', $form_state->getValue('mail'));
    foreach ($mails as $mail) {
      if (!$this->emailValidator->isValid(trim($mail))) {
        $form_state->setError(
          $form['mail'],
          new TranslatableMarkup(
            'Invalid email address: <strong>@address</strong>',
            ['@address' => $mail]
          )
        );
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config =  $this->configFactory->getEditable('crosscut_logger.settings');
    $config->set('enable', (bool) $form_state->getValue('enable'));
    $config->set('mail', $form_state->getValue('mail'));
    $config->set('level', $form_state->getValue('level'));

    $type = trim($form_state->getValue('type'));
    if (empty($type)) {
      $config->set('type', []);
    }
    else {
      $config->set('type', explode("\r\n", $type));
    }

    $config->save();

    parent::submitForm($form, $form_state);
  }
}
