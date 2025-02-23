import React, { useState, useEffect, useContext } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Slider,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
  useColorModeValue,
  Flex,
  Spacer,
  Text,
  HStack,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  useToast,
  useColorMode,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';

import { useQuery, useQueryClient } from 'react-query';

import { AiFillHeart } from 'react-icons/ai';
import { AiFillBulb } from 'react-icons/ai';
import { BsFillCameraVideoFill } from 'react-icons/bs';
import { FaTheaterMasks } from 'react-icons/fa';

import { getMovies } from '../../utils/queries';
import { ReviewEndpointBodyType } from '../../types/APITypes';
import { ReviewModalContext } from '../../utils/ModalContext';
import { User } from 'next-auth';

export const ReviewModal: React.FC<{
  user: User;
  inNav?: boolean;
  inMobileNav?: boolean;
}> = ({ user, inNav = false, inMobileNav = false }): React.ReactElement => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose, movie, setMovie } = useContext(
    ReviewModalContext
  );
  const [isEditingReview, setIsEditingReview] = useState(false);

  const [isOpenedFromMovie, setIsOpenedFromMovie] = useState(false);
  const [rating, setRating] = useState(0);
  const [cinema, setCinema] = useState(0);
  const [concept, setConcept] = useState(0);
  const [perform, setPerform] = useState(0);
  const [comment, setComment] = useState(``);
  const [commentError, setCommentError] = useState(``);
  const [movieError, setMovieError] = useState(``);
  const [success, setSuccess] = useState(``);

  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    if (success) {
      queryClient
        .invalidateQueries(`movie-${movie?.name}`)
        .catch(console.error);
      queryClient.invalidateQueries(`movies`).catch(console.error);
      toast({
        variant: `solid`,
        title: success === `addition` ? `Review Added` : `Review Modified`,
        description:
          success === `addition`
            ? `Your review was successfully added to ${movie?.name}`
            : `Your review on ${movie?.name} was successfully modified`,
        status: `success`,
        duration: 5000,
        isClosable: true,
      });
      setSuccess('');
    }
  }, [movie, queryClient, success, toast]);
  const { data: movies } = useQuery(`movies`, getMovies);

  useEffect(() => {
    if (!isOpen) {
      setIsEditingReview(false);
      setRating(0);
      setComment(``);
      return;
    }
    if (movie) {
      const rvw = movie?.reviews.find((review) => {
        return review?.user?._id === user.sub;
      });
      if (rvw) {
        setIsEditingReview(true);
        setConcept(rvw.concept);
        setCinema(rvw.cinema);
        setPerform(rvw.perform);
        setRating(rvw.rating);
        return setComment(rvw?.comment || '');
      }
    }
    setIsEditingReview(false);
    setConcept(0);
    setCinema(0);
    setPerform(0);
    setRating(0);
    setComment(``);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return setIsOpenedFromMovie(false);
    }
    if (movie) {
      setIsOpenedFromMovie(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    onClose: () => void
  ) => {
    e.preventDefault();
    if (!movie) {
      return setMovieError(`Please select a valid film.`);
    }
    const data: ReviewEndpointBodyType = {
      // eslint-disable-next-line no-underscore-dangle
      movieID: movie._id,
      comment,
      rating,
      cinema,
      concept,
      perform

    };
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URI}/api/review`, {
      method: `post`,
      body: JSON.stringify(data),
    });

    const successData = await res.json();
    if (res.status === 200) {
      setSuccess(successData.type);
      setComment(``);
      setMovie(null);
      return onClose();
    }
    if (res.status === 401) return setCommentError('You are not authorized');
    return setCommentError(successData?.message || `There was an error...`);
  };

  const handleRatingChange = (x: number): void => {
    return setRating(x);
  };
  const handleNumInputRatingChange = (x: string, y: number): void => {
    return setRating(y);
  };
  
  const handleConceptChange = (x: number): void => {
    return setConcept(x);
  };
  const handleNumInputConceptChange = (x: string, y: number): void => {
    return setConcept(y);
  };
  
  const handleCinemaChange = (x: number): void => {
    return setCinema(x);
  };
  const handleNumInputCinemaChange = (x: string, y: number): void => {
    return setCinema(y);
  };
  
  const handlePerformChange = (x: number): void => {
    return setPerform(x);
  };
  const handleNumInputPerformChange = (x: string, y: number): void => {
    return setPerform(y);
  };

  return (
    <>
      {inMobileNav ? (
        <Button
          mt={2}
          leftIcon={<AddIcon />}
          w="95%"
          mx={'auto'}
          variant="ghost"
          onClick={() => {
            setMovie(null);
            onOpen();
          }}
        >
          Add review
        </Button>
      ) : (
        <Button
          variant="ghost"
          width={inNav ? '' : 'full'}
          colorScheme={process.env.COLOR_THEME}
          mr={user?.isAdmin ? 0 : 3}
          leftIcon={<AddIcon />}
          onClick={() => {
            setMovie(null);
            onOpen();
          }}
        >
          {' '}
          Add review
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} id={'review-modal'} scrollBehavior={'inside'} >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading
              fontSize="2xl"
              fontWeight="semibold"
              maxWidth="85%"
              mr="auto"
            >
              {isEditingReview && movie
                ? `Editing review for ${movie?.name}`
                : isOpenedFromMovie && movie
                ? `Add a review for ${movie?.name}`
                : 'Add a review'}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              {!isOpenedFromMovie && (
                <>
                  <FormLabel mb={3} fontSize="1.1em" fontWeight="semibold">
                    Select Film
                  </FormLabel>

                  <Select
                    bg={colorMode === 'light' ? 'white' : 'gray.700'}
                    placeholder={movie?.name || 'No Movie Selected'}
                    onChange={(e) => {
                      e.preventDefault();
                      const movieFound = movies?.find(
                        (mv) => mv?.name === e.target.value
                      );
                      if (!movieFound) {
                        return setMovieError(`Please select a valid film!`);
                      }
                      setMovieError(``);
                      return setMovie(movieFound);
                    }}
                  >
                    {movies &&
                      movies?.map((_) =>
                        movie?.name !== _.name ? (
                          <option key={_.name}>{_.name}</option>
                        ) : (
                          ''
                        )
                      )}
                  </Select>
                </>
              )}
              {movieError && (
                <Text color={colorMode === 'light' ? `red.600` : `red.300`}>
                  {movieError}
                </Text>
              )}

        <Accordion defaultIndex={0} allowToggle >
          <AccordionItem>
            <AccordionButton ml={-3}>
                <HStack my={3} justifyContent='space-between'>
                    <Text fontSize="1.1em" fontWeight="semibold">
                    Concept
                    </Text>
                    <Spacer />
                    <Text color={useColorModeValue(`gray.600`, `gray.400`)}>
                    {concept}/10
                    </Text>
                    <Spacer />
                    <AccordionIcon />
                </HStack>
            </AccordionButton>
            <AccordionPanel ml={-3} pt={-10} pb={4}>
              <FormLabel fontSize="1em">
                Premise, plot, and structure
              </FormLabel>
                <Box>
                  <Flex>
                  <NumberInput
                    max={10}
                    min={0}
                    inputMode="decimal"
                    step={0.1}
                    maxW="100px"
                    mr="2rem"
                    value={concept}
                    onChange={handleNumInputConceptChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    min={0}
                    max={10}
                    step={0.5}
                    flex="1"
                    focusThumbOnChange={false}
                    value={concept}
                    onChange={handleConceptChange}
                  >
                    <SliderTrack>
                      <SliderFilledTrack
                        bg={useColorModeValue(`cyan.500`, `cyan.300`)}
                      />
                    </SliderTrack>
                    <SliderThumb fontSize="sm" boxSize={6}>
                      <Box
                        color={useColorModeValue(`cyan.500`, `cyan.500`)}
                        as={AiFillBulb}
                      />
                    </SliderThumb>
                  </Slider>
                </Flex>
              </Box>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem >
            <AccordionButton ml={-3}>
                <HStack my={3} justifyContent="space-between">
                  <Text fontSize="1.1em" fontWeight="semibold">
                    Cinematography
                  </Text>
                  <Text color={useColorModeValue(`gray.600`, `gray.400`)}>
                    {cinema}/10
                  </Text>
                </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel ml={-3} pt={-10} pb={4}>
            <FormLabel fontSize="1em">
              Visuals, sound, direction, and design
            </FormLabel>
              <Box>
                <Flex>
                  <NumberInput
                    max={10}
                    min={0}
                    inputMode="decimal"
                    step={0.1}
                    maxW="100px"
                    mr="2rem"
                    value={cinema}
                    onChange={handleNumInputCinemaChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    min={0}
                    max={10}
                    step={0.5}
                    flex="1"
                    focusThumbOnChange={false}
                    value={cinema}
                    onChange={handleCinemaChange}
                  >
                    <SliderTrack>
                      <SliderFilledTrack
                        bg={useColorModeValue(`yellow.500`, `yellow.300`)}
                      />
                    </SliderTrack>
                    <SliderThumb fontSize="sm" boxSize={6}>
                      <Box
                        color={useColorModeValue(`yellow.500`, `yellow.500`)}
                        as={BsFillCameraVideoFill}
                      />
                    </SliderThumb>
                  </Slider>
                </Flex>
              </Box>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem >
            <AccordionButton ml={-3}>
              <HStack my={3} justifyContent="space-between">
                <Text fontSize="1.1em" fontWeight="semibold">
                  Performance
                </Text>
                <Text color={useColorModeValue(`gray.600`, `gray.400`)}>
                  {perform}/10
                </Text>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel ml={-3} pt={-10} pb={4}>
              <FormLabel fontSize="1em">
                Acting, narration, and technique
              </FormLabel>
              <Box>
                <Flex>
                  <NumberInput
                    max={10}
                    min={0}
                    inputMode="decimal"
                    step={0.1}
                    maxW="100px"
                    mr="2rem"
                    value={perform}
                    onChange={handleNumInputPerformChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    min={0}
                    max={10}
                    step={0.5}
                    flex="1"
                    focusThumbOnChange={false}
                    value={perform}
                    onChange={handlePerformChange}
                  >
                    <SliderTrack>
                      <SliderFilledTrack
                        bg={useColorModeValue(`red.500`, `red.300`)}
                      />
                    </SliderTrack>
                    <SliderThumb fontSize="sm" boxSize={6}>
                      <Box
                        color={useColorModeValue(`red.500`, `red.500`)}
                        as={FaTheaterMasks}
                      />
                    </SliderThumb>
                  </Slider>
                </Flex>
              </Box>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton ml={-3}>
                <HStack my={3} justifyContent="space-between">
                  <Text fontSize="1.1em" fontWeight="semibold">
                    Overall Rating
                  </Text>
                  <Text color={useColorModeValue(`gray.600`, `gray.400`)}>
                    {rating}/10
                  </Text>
                </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel ml={-3} pb={4}>
              <Box>
                <Flex>
                  <NumberInput
                    max={10}
                    min={0}
                    inputMode="decimal"
                    step={0.1}
                    maxW="100px"
                    mr="2rem"
                    value={rating}
                    onChange={handleNumInputRatingChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    min={0}
                    max={10}
                    step={0.5}
                    flex="1"
                    focusThumbOnChange={false}
                    value={rating}
                    onChange={handleRatingChange}
                  >
                    <SliderTrack>
                      <SliderFilledTrack
                        bg={useColorModeValue(
                          `${process.env.COLOR_THEME}.500`,
                          `${process.env.COLOR_THEME}.300`
                        )}
                      />
                    </SliderTrack>
                    <SliderThumb fontSize="sm" boxSize={6}>
                      <Box
                        color={useColorModeValue(
                          `${process.env.COLOR_THEME}.500`,
                          `${process.env.COLOR_THEME}.300`
                        )}
                        as={AiFillHeart}
                      />
                    </SliderThumb>
                  </Slider>
                </Flex>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
              <Text my={3} fontSize="1.1em" fontWeight="semibold">Enter a comment!</Text>
              <Textarea
                value={comment}
                onChange={(e) => {
                  e.preventDefault();

                  if (
                    e.target.value?.length > 1250 &&
                    e.target.value.length !== 0
                  ) {
                    setCommentError(
                      `Comment needs to be less than 900 characters`
                    );
                  } else {
                    setCommentError(``);
                  }
                  return setComment(e.target.value);
                }}
                placeholder="This film was great because it was..."
                resize="vertical"
              />
              {commentError && (
                <Text color={colorMode === 'light' ? `red.600` : `red.300`}>
                  {commentError}
                </Text>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter
            bg={useColorModeValue(`gray.100`, `gray.800`)}
            borderBottomRadius="md"
          >
            <Button
              colorScheme={process.env.COLOR_THEME}
              mr={3}
              onClick={(e) => handleSubmit(e, onClose)}
              isDisabled={!!(commentError || movieError)}
            >
              {isEditingReview && movie ? 'Edit Review' : 'Submit Review'}
            </Button>
            <Button
              onClick={() => {
                onClose();
                setMovie(null);
                setIsOpenedFromMovie(false);
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
