import {
  Container,
  SimpleGrid,
  Box,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  chakra,
  useColorModeValue,
  useToast,
  useColorMode,
  Stack,
  IconButton,
  Tooltip,
  useBreakpoint,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverArrow,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Tag,
  Checkbox,
  Portal,
  PopoverFooter,
  useTheme,
} from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';
import 'react-toggle/style.css';
import { AiOutlineSearch } from 'react-icons/ai';
import { BiChevronDown } from 'react-icons/bi';
import { useState } from 'react';
import { useEffect } from 'react';
import Card from '../Card';
import { ReviewType, SerializedMovieType } from '../../models/movie';
import { PopulatedUserType } from '../../models/user';
import { NextSeo } from 'next-seo';
import ReviewModal from '../ReviewModal';
import Link from 'next/link';
import { UserAuthType } from 'next-auth';

import MovieGridView from '../MovieGridView';
import { BsGrid3X3Gap } from 'react-icons/bs';
import { HiViewList } from 'react-icons/hi';
import { getColorSchemeCharCode, getMovieGenres } from '../../utils/utils';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface CardGridProps {
  movies: SerializedMovieType<ReviewType<PopulatedUserType>[]>[];
  user: UserAuthType;
}

export const CardGrid: React.FC<CardGridProps> = ({
  movies: unSortedMovies,
  user,
}): React.ReactElement => {
  const bp = useBreakpoint();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('recent');
  const [cardView, setCardView] = useState(true);
  const [genres, setGenres] = useState<string[]>([]);
  const [isGenreFilterActive, setIsGenreFilterActive] = useState(false);

  const toast = useToast();
  const { colorMode } = useColorMode();
  // Fix for https://github.com/chakra-ui/chakra-ui/issues/3076
  useEffect(() => {
    toast.update(`otherToast`, {
      variant: `solid`,
      title: 'Movie not found',
      description: 'The shared movie does not exist',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [colorMode, toast]);

  const movies = {
    data: unSortedMovies
      ?.filter((mv) => {
        if (mv && mv.name.toLowerCase().includes(filter)) {
          return true;
        }

        return false;
      })
      .filter((mv) => {
        if (isGenreFilterActive) {
          return mv.genres.some((g) => genres.includes(g));
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'recent' || sort === 'old') {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        } else if (sort === 'best') {
          return a.rating - b.rating;
        } else if (sort === 'worst') {
          return a.rating - b.rating;
        }
        return 0;
      }),
  };

  if (sort === 'best' || sort === 'recent') {
    movies.data = movies.data.reverse();
  }

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'ScuffedMDB';
  const siteURI =
    process.env.NEXT_PUBLIC_APP_URI || 'https://www.movie.michael-hall.me';
  const handleGenreClick = (genre: string) => {
    setGenres((gnr) => {
      setIsGenreFilterActive(true);
      if (gnr.includes(genre)) {
        //remove genre
        const removedGenre = gnr.filter((g) => g !== genre);

        if (removedGenre.length === 0) {
          setIsGenreFilterActive(false);
        }
        return removedGenre;
      }

      return [...gnr, genre];
    });
  };
  const theme = useTheme();
  return (
    <>
      <NextSeo
        openGraph={{
          title: siteName,
          type: `website`,
          site_name: siteName,
          images: [
            {
              width: 2542,
              height: 1312,
              url: `${siteURI}/sitePicture.png`,
              alt: siteName + ' webpage',
            },
          ],
        }}
        description={'A private movie rating website'}
      />

      <Container maxW="container.xl" mt={10}>
        <Heading fontSize={{ base: '4xl', md: '6xl' }} textAlign="center">
          We have reviewed{' '}
          {
            <chakra.span color={useColorModeValue('purple.500', 'purple.300')}>
              {unSortedMovies?.length}
            </chakra.span>
          }{' '}films
        </Heading>
        <Flex
          width="full"
          direction={{ base: 'column', md: 'row' }}
          my={7}
          justifyContent="space-between"
        >
          <Flex mb={{ base: 4, md: 0 }}>
            {(user.isReviewer || user.isAdmin) && <ReviewModal user={user} />}
          </Flex>

          <Stack direction={{ base: 'column', md: 'row' }}>
            <InputGroup maxWidth={{ base: 'full', md: '200px' }}>
              <InputLeftElement pointerEvents="none">
                <AiOutlineSearch color="gray.300" />
              </InputLeftElement>
              <Input
                variant="filled"
                type="text"
                placeholder="Search"
                onChange={(e) => setFilter(e.target.value.toLowerCase())}
              />
            </InputGroup>
            <Stack isInline alignItems="center">
              <Popover>
                <PopoverTrigger>
                  <Button rightIcon={<ChevronDownIcon />}>
                    Filter by genre
                  </Button>
                </PopoverTrigger>
                <Portal>
                  {/* render into a portal to prevent the card underneath interfering with the popover */}
                  <PopoverContent zIndex={10000}>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader ml="5px" fontWeight="bold">
                      Filter search by genre
                    </PopoverHeader>
                    <PopoverBody>
                      <Flex wrap="wrap">
                        {getMovieGenres(unSortedMovies).map(
                          (genre: string, i) => {
                            const genreColor = getColorSchemeCharCode(genre);
                            const dark = transparentize(
                              `${genreColor}.200`,
                              0.16
                            )(theme);
                            const light = transparentize(
                              `${genreColor}.500`,
                              0.2
                            )(theme);
                            return (
                              <Tag
                                mx="5px"
                                my="3px"
                                key={i.toString() + 'genreTag'}
                                fontWeight="semibold"
                                colorScheme={genreColor}
                                bg={colorMode === 'light' ? light : dark}
                                cursor="pointer"
                                userSelect="none"
                                onClick={() => handleGenreClick(genre)}
                              >
                                <Checkbox
                                  isChecked={genres.includes(genre)}
                                  colorScheme={genreColor}
                                  borderColor={`${genreColor}.300`}
                                  mr="4px"
                                  zIndex="-1"
                                  size="sm"
                                />
                                {genre}
                              </Tag>
                            );
                          }
                        )}
                      </Flex>
                    </PopoverBody>
                    <PopoverFooter display="flex" justifyContent="flex-end">
                      <Button
                        onClick={() => {
                          setGenres([]);
                          setIsGenreFilterActive(false);
                        }}
                      >
                        Clear All
                      </Button>
                    </PopoverFooter>
                  </PopoverContent>
                </Portal>
              </Popover>
              <Menu>
                <MenuButton as={Button} rightIcon={<BiChevronDown />}>
                  Sort by...
                </MenuButton>
                <MenuList zIndex={998}>
                  <MenuItem
                    zIndex={999}
                    isDisabled={sort === 'recent'}
                    onClick={() => setSort('recent')}
                  >
                    Most Recent
                  </MenuItem>
                  <MenuItem
                    zIndex={999}
                    isDisabled={sort === 'old'}
                    onClick={() => setSort('old')}
                  >
                    Oldest
                  </MenuItem>
                  <MenuItem
                    zIndex={999}
                    isDisabled={sort === 'best'}
                    onClick={() => setSort('best')}
                  >
                    Best
                  </MenuItem>
                  <MenuItem
                    zIndex={999}
                    isDisabled={sort === 'worst'}
                    onClick={() => setSort('worst')}
                  >
                    Worst
                  </MenuItem>
                </MenuList>
              </Menu>

              <Tooltip
                label="Toggle between grid and list view"
                placement="top"
              >
                <Stack
                  isInline
                  bg={useColorModeValue('gray.100', 'whiteAlpha.200')}
                  height="full"
                  alignItems="center"
                  px={1}
                  borderRadius="md"
                >
                  <IconButton
                    bg={cardView ? 'purple.300' : 'transparent'}
                    size="sm"
                    onClick={() => setCardView(true)}
                    aria-label="Activate table mode"
                    colorScheme={cardView ? 'purple' : 'gray'}
                    icon={<BsGrid3X3Gap size="1.1rem" />}
                  />
                  <IconButton
                    size="sm"
                    bg={!cardView ? 'purple.300' : 'transparent'}
                    onClick={() => setCardView(false)}
                    aria-label="Activate table mode"
                    colorScheme={!cardView ? 'purple' : 'gray'}
                    icon={<HiViewList size="1.1rem" />}
                  />
                </Stack>
              </Tooltip>
            </Stack>
          </Stack>
        </Flex>
        {cardView ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={10}
            alignItems="stretch"
          >
            {movies?.data?.map(
              (
                movie: SerializedMovieType<ReviewType<PopulatedUserType>[]>,
                i
              ) => (
                <Link
                  key={`${i.toString()}cardBox`}
                  href={`/movie/${movie._id}`}
                  passHref
                >
                  <Box as={'a'} height="full">
                    <Card movie={movie} key={`${i.toString()}card`} />
                  </Box>
                </Link>
              )
            )}
          </SimpleGrid>
        ) : (
          <chakra.div
            overflowX={
              ['base', 'sm', 'md'].includes(bp || '') ? 'scroll' : 'hidden'
            }
            shadow="lg"
            maxW="full"
            borderRadius="xl"
            border="1px solid"
            borderColor={colorMode === 'light' ? 'gray.300' : 'gray.700'}
          >
            <MovieGridView user={user} movies={movies.data} />
          </chakra.div>
        )}
      </Container>
    </>
  );
};
